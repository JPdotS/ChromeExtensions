
var url = window.location.toString();
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  var url = tabs[0].url
  const domain = (new URL(url)).hostname.replace('www.','').toLowerCase();


  urlParts = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(url);
  
  path = urlParts[2];
  if (path === '/'){
    path = ''
  }

  proto_host = url.replace(path, '').toLowerCase()

  spaces =  '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'

  var _domain = domain
  if (domain.endsWith('01') || domain.endsWith('02')) {
    _domain = domain.slice(0, -2)
  }

  if (domain.includes('qa')) {
    _domain = _domain.replace('qa', 'prod')
  }

  if(_domain.includes('prod')){
    _qa_domain = _domain.replace('prod', 'qa')
  }
  else{
    _qa_domain = 'qa'+_domain
  }
    
  
  var top = ' '
  top += 'domain: ' + domain + '</br>'
  // top += 'proto_host: ' + proto_host + '</br>'
  // top += 'path: ' + path + '</br>'
  top += '_domain: ' + _domain + '</br>'
  top += '_qadomain: ' + _qa_domain + '</br>'

  table =  ' '
  table += '<table align="center">'

  table += '  <tr>'
  table += '    <td align="center">'
  table += '<b><a href="'+ proto_host.replace(domain, _domain) + path +'" target="_blank"> prod </a></b>'
  table += '    </td>'
  table += '    <td align="center">'
  table += '<b><a href="'+ proto_host.replace(domain, _qa_domain) + path +'" target="_blank"> qa </a></b>'
  table += '    </td>'
  table += '    <td align="center">'
  table += '<b><a href="'+ proto_host.replace(domain, 'adsg-ln21') + path +'" target="_blank"> dev </a></b>'
  table += '    </td>'
  table += '  </tr>'

  table += '  <tr>'
  table += '    <td align="center">'
  table += '<a href="'+ proto_host.replace(domain, _domain+'01') + path +'" target="_blank">01</a>'
  table += '    </td>'
  table += '    <td align="center">'
  table += '<a href="'+ proto_host.replace(domain, _qa_domain+'01') + path +'" target="_blank">01</a>'
  table += '    </td>'
  table += '    <td align="center">'
  table += ''
  table += '    </td>'
  table += '  </tr>'

  table += '  <tr>'
  table += '    <td align="center">'
  table += '<a href="'+ proto_host.replace(domain, _domain+'02') + path +'" target="_blank">02</a>'
  table += '    </td>'
  table += '    <td align="center">'
  table += '<a href="'+ proto_host.replace(domain, _qa_domain+'02') + path +'" target="_blank">02</a>'
  table += '    </td>'
  table += '    <td align="center">'
  table += ''
  table += '    </td>'
  table += '  </tr>'
  
  table += '  <tr>'
  table += '    <td align="center">'
  table += spaces
  table += '    </td>'
  table += '    <td align="center">'
  table += spaces
  table += '    </td>'
  table += '    <td align="center">'
  table += spaces
  table += '    </td>'
  table += '  </tr>'

  table += '</table>'
  
  var element = document.querySelector("#greeting");
  element.innerHTML = top + table;
});

