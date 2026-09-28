import './styles.css';

const tome = new URLSearchParams(location.search).get('tome');
if (tome === 'oop') {
  (await import('./oop/app.js')).mountOopApp();
} else if (tome === 'edp') {
  (await import('./edp/app.js')).mountEdpApp();
} else {
  (await import('./landing/landing.js')).mountLanding();
}
