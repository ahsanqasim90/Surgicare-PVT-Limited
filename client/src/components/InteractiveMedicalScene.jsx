import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export default function InteractiveMedicalScene(){
  const mountRef=useRef(null);
  const [webglReady,setWebglReady]=useState(true);

  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount)return undefined;
    let renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setWebglReady(false);return undefined;}

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(38,1,.1,100);
    camera.position.set(0,.25,8.6);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.25;
    renderer.domElement.setAttribute('aria-label','Interactive three-dimensional Surgicare healthcare symbol');
    mount.appendChild(renderer.domElement);

    const world=new THREE.Group();
    scene.add(world);
    const glass=new THREE.MeshPhysicalMaterial({color:0x22c9a0,metalness:.08,roughness:.12,transmission:.62,thickness:1.3,transparent:true,opacity:.94,clearcoat:1,clearcoatRoughness:.08,emissive:0x063f35,emissiveIntensity:.7});
    const edgeMaterial=new THREE.MeshStandardMaterial({color:0xc4fff0,metalness:.55,roughness:.22,emissive:0x0d6959,emissiveIntensity:.55});
    const cross=new THREE.Group();
    const vertical=new THREE.Mesh(new RoundedBoxGeometry(1.25,4.25,.72,6,.2),glass);
    const horizontal=new THREE.Mesh(new RoundedBoxGeometry(3.65,1.25,.72,6,.2),glass);
    vertical.castShadow=true;horizontal.castShadow=true;
    cross.add(vertical,horizontal);
    cross.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.54,3),edgeMaterial));
    cross.rotation.set(-.08,.38,-.06);
    world.add(cross);

    const rings=new THREE.Group();
    const ringMaterial=new THREE.MeshStandardMaterial({color:0x7de9d0,metalness:.7,roughness:.2,transparent:true,opacity:.72});
    [[3.15,.025,0],[2.55,.022,1],[3.75,.018,2]].forEach(([radius,tube,index])=>{
      const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,150),ringMaterial.clone());
      ring.rotation.set(index===0?1.08:.35,index===1?.42:1.1,index===2?.2:-.45);
      rings.add(ring);
    });
    world.add(rings);

    const nodeMaterial=new THREE.MeshPhysicalMaterial({color:0xeafff9,emissive:0x33d7ad,emissiveIntensity:1.4,roughness:.12,metalness:.15});
    const nodes=[];
    for(let i=0;i<10;i+=1){
      const node=new THREE.Mesh(new THREE.SphereGeometry(i%3===0?.13:.08,20,20),nodeMaterial);
      const angle=(i/10)*Math.PI*2;
      node.position.set(Math.cos(angle)*3.1,Math.sin(angle)*1.72,Math.sin(angle*2)*.75);
      nodes.push(node);world.add(node);
    }

    const particleCount=180;
    const positions=new Float32Array(particleCount*3);
    for(let i=0;i<particleCount;i+=1){
      const radius=3.2+Math.random()*3.7;
      const theta=Math.random()*Math.PI*2;
      positions[i*3]=Math.cos(theta)*radius;
      positions[i*3+1]=(Math.random()-.5)*6.5;
      positions[i*3+2]=Math.sin(theta)*radius-1;
    }
    const particleGeometry=new THREE.BufferGeometry();
    particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({color:0x70e7cb,size:.035,transparent:true,opacity:.6,sizeAttenuation:true}));
    world.add(particles);

    scene.add(new THREE.HemisphereLight(0xbafbef,0x031518,2.5));
    const keyLight=new THREE.PointLight(0x7bffe1,85,25,1.7);keyLight.position.set(4,5,6);scene.add(keyLight);
    const rimLight=new THREE.PointLight(0x2188ff,70,25,2);rimLight.position.set(-5,-2,3);scene.add(rimLight);
    const warmLight=new THREE.PointLight(0xffffff,35,18,2);warmLight.position.set(1,-5,5);scene.add(warmLight);

    const pointer={x:0,y:0};
    const pointerTarget={x:0,y:0};
    const onPointerMove=(event)=>{const rect=mount.getBoundingClientRect();pointerTarget.x=((event.clientX-rect.left)/rect.width-.5)*2;pointerTarget.y=-((event.clientY-rect.top)/rect.height-.5)*2;};
    const onPointerLeave=()=>{pointerTarget.x=0;pointerTarget.y=0;};
    mount.addEventListener('pointermove',onPointerMove);mount.addEventListener('pointerleave',onPointerLeave);

    const resize=()=>{const width=Math.max(mount.clientWidth,1);const height=Math.max(mount.clientHeight,1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount);resize();
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock=new THREE.Clock();
    let frame;
    const render=()=>{
      const elapsed=clock.getElapsedTime();
      pointer.x+=(pointerTarget.x-pointer.x)*.045;pointer.y+=(pointerTarget.y-pointer.y)*.045;
      world.rotation.y=pointer.x*.22;world.rotation.x=-pointer.y*.12;
      cross.rotation.y=.38+pointer.x*.32+(reduceMotion?0:elapsed*.13);cross.rotation.x=-.08-pointer.y*.18;cross.position.y=reduceMotion?0:Math.sin(elapsed*.9)*.13;
      rings.rotation.z=reduceMotion?0:elapsed*.055;rings.rotation.y=pointer.x*.2+(reduceMotion?0:-elapsed*.035);particles.rotation.y=reduceMotion?0:elapsed*.018;
      nodes.forEach((node,index)=>node.scale.setScalar(1+(reduceMotion?0:Math.sin(elapsed*2+index)*.16)));
      camera.position.x+=(pointer.x*.34-camera.position.x)*.025;camera.position.y+=(.25+pointer.y*.24-camera.position.y)*.025;camera.lookAt(0,0,0);
      renderer.render(scene,camera);frame=requestAnimationFrame(render);
    };
    render();

    return ()=>{
      cancelAnimationFrame(frame);resizeObserver.disconnect();mount.removeEventListener('pointermove',onPointerMove);mount.removeEventListener('pointerleave',onPointerLeave);
      scene.traverse((object)=>{if(object.geometry)object.geometry.dispose();if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach((material)=>material.dispose());}});
      renderer.dispose();renderer.domElement.remove();
    };
  },[]);

  return <div ref={mountRef} className="medical-3d-scene">
    {!webglReady&&<img className="medical-3d-fallback" src="/images/3d/medical-supply-hero-3d.png" alt="Surgicare medical supply collection"/>}
    <div className="scene-live-label"><i/> LIVE 3D EXPERIENCE</div>
    <div className="scene-instruction">Move your cursor to explore</div>
  </div>;
}
