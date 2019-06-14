import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './provider/template';
import templateModdleDescriptor from './descriptors/template';

import {
  debounce
} from 'min-dash';

import diagramXML from '../resources/initialDiagram.bpmn';

var container = $('#js-drop-zone');

var bpmnModeler = new BpmnModeler({
  container: '#js-canvas',
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    template: templateModdleDescriptor,
  }

});

function setDiagramXML() {
  var placeholderForDiagram = document.getElementById('editForm:workflowTabView:xmlDiagram');
  if (placeholderForDiagram) {
    var loadDiagramXML = placeholderForDiagram.value;
    openDiagram(loadDiagramXML);
  } else {
    alert('diagram is empty!');
  }
}

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {
  var xmlParam;
  var svgParam;
  bpmnModeler.importXML(xml, function(err) {
    err ? (container.removeClass('with-diagram').addClass('with-error'), container.find('.error pre').text(err.message), console.error(err)) : container.removeClass('with-error').addClass('with-diagram');
  })
};

saveDiagramFunctionCall = function saveDiagramAction() {
  var xmlParam = "";
  var svgParam = "";
  bpmnModeler.saveXML({
    format: !0
  }, function(err, xml) {
    err ? alert('diagram xml save failed', err) : xmlParam = xml;
  });
  bpmnModeler.saveSVG({
    format: !0
  }, function(err, svg) {
    err ? alert('diagram svg save failed', err) : svgParam = svg;
  });

  document.getElementById('editForm:workflowTabView:xmlDiagram').value = xmlParam + "kitodo-diagram-separator" + svgParam;
};

var modelerActions = {

  'modeler.toggleFullscreen': function() {
    var elem = document.querySelector('#js-drop-zone');
    toggleFullScreen(elem);
  },
  'modeler.zoomReset': function() {
    bpmnModeler.get('zoomScroll').reset();
  },
  'modeler.zoomIn': function(e) {
    bpmnModeler.get('zoomScroll').stepZoom(1);
  },
  'modeler.zoomOut': function(e) {
    bpmnModeler.get('zoomScroll').stepZoom(-1);
  }
};


function toggleFullScreen(element) {

  if (!document.fullscreenElement &&
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();

    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}


$(function() {

  function actionListener(event) {
    var jsaction = parseActionAttr($(this));

    var name = jsaction.name,
      action = modelerActions[name];

    if (!action) {
      throw new Error('no action <' + name + '> defined');
    }

    event.preventDefault();

    action(event);
  }

  var delegates = {};

  $('[jsaction]').each(function() {

    var jsaction = parseActionAttr($(this));

    var event = jsaction.event;

    if (!delegates[event]) {
      $(document.body).on(event, '[jsaction]', actionListener);
      delegates[event] = true;
    }


    var name = jsaction.name,
      handler = modelerActions[name];

    if (!handler) {
      throw new Error('no action <' + name + '> defined');
    }
  });

  function parseActionAttr(element) {

    var match = $(element).attr('jsaction').split(/:(.+$)/, 2);

    //jsaction="event:modelerAction"
    return {
      event: match[0],
      name: match[1]
    };
  }

  $('#editForm\\:workflowTabView\\:js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  $('#editForm\\:workflowTabView\\:btnReadXmlDiagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    setDiagramXML();
  });

});
