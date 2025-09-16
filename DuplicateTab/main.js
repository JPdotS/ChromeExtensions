
var url = window.location.toString();
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  var url = tabs[0].url
  const domain = (new URL(url)).hostname.replace('www.','').toLowerCase();


  // urlParts = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(url);
  // path = urlParts[2];

  var urlParts = url.split(domain)
  var path = urlParts[1]

  if (path === '/'){
    path = ''
  }

  var proto_host = url.replace(path, '').toLowerCase()

  // var spaces =  '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'

  var _dev0_domain = 'adsg-ln21'
  var _dev1_domain = 'cypnl01'
  var _dev2_domain = 'forge'

  var _domain = [_dev0_domain, _dev1_domain, _dev2_domain].includes(domain) ? 'cybox' : domain
  if (domain.endsWith('01') || domain.endsWith('02')) {
    _domain = domain.slice(0, -2)
  }

  if (domain.includes('batchqa')) {
    _domain = _domain.replace('qa', 'prod')
  } else if (domain.includes('qa')) {
    _domain = _domain.replace('qa', '')
  }

  if(_domain.includes('prod')){
    _qa_domain = _domain.replace('prod', 'qa')
  }
  else{
    _qa_domain = 'qa'+_domain
  }
    
  const htmlContent = `
    <div align="center"><b>${domain}</b> (this domain)</div>
    </br>
    <table align="center">
      <tr>
        <td align="center">
          <b><a href="${proto_host.replace(domain, _domain)}${path}" target="_blank">${_domain}</a></b>
        </td>
        <td align="center">
          <b><a href="${proto_host.replace(domain, _qa_domain)}${path}" target="_blank">${_qa_domain}</a></b>
        </td>
        <td align="center">
          <b><a href="${proto_host.replace(domain, _dev0_domain)}${path}" target="_blank">${_dev0_domain}</a></b>
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href="${proto_host.replace(domain, _domain + '01')}${path}" target="_blank">${_domain}01</a>
        </td>
        <td align="center">
          <a href="${proto_host.replace(domain, _qa_domain + '01')}${path}" target="_blank">${_qa_domain}01</a>
        </td>
        <td align="center">
          <b><a href="${proto_host.replace(domain, _dev1_domain)}${path}" target="_blank">${_dev1_domain}</a></b>
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href="${proto_host.replace(domain, _domain + '02')}${path}" target="_blank">${_domain}02</a>
        </td>
        <td align="center">
          <a href="${proto_host.replace(domain, _qa_domain + '02')}${path}" target="_blank">${_qa_domain}02</a>
        </td>
        <td align="center">
          <b><a href="${proto_host.replace(domain, _dev2_domain)}${path}" target="_blank">${_dev2_domain}</a></b>
        </td>
      </tr>
    </table>
    </br>
    ${path}  <i>(path)</i></br>
  `;
  
  var element = document.querySelector("#greeting");
  element.innerHTML = htmlContent;
});

