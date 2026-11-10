export const companyDetails={
  name:'Surgicare',
  established:'2016',
  address:'Flat No. 1, 4th Floor, Kursheed Plaza, Ichhra, Lahore',
  phones:['+92 333 4046873','+92 324 4378226'],
  email:'muhammadqasimeid@gmail.com',
  ntn:'6054812-8'
};

export const phoneHref=value=>`tel:${value.replace(/[^+\d]/g,'')}`;
