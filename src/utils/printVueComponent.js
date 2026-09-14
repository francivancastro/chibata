import Vue from "vue";
import jspdf from "jspdf";


function printComponent(component, props) {
  const doc = new jspdf();
  let instance = new Vue({
    ...component,
    parent: this,
    propsData: props,
  }).$mount();

  let html = instance.$el.outerHTML

  instance.$destroy()

  doc.html(html, {
    callback: function (doc) {
      doc.output('dataurlnewwindow', 'ficha.pdf');
    },
    width: 210,
    windowWidth: 650, //window width in CSS pixels
  });
}

export default printComponent