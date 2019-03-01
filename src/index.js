import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import 'jquery-ujs';
import 'select2/dist/css/select2.min.css';
import 'select2';
import '@ttskch/select2-bootstrap4-theme/dist/select2-bootstrap4.css';

$(() => {
  $('.select2').select2();
});

$.fn.select2.defaults.set('theme', 'bootstrap4');
