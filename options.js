// Saves options to chrome.storage
function save_options() {
  var fontsize = document.getElementById('fontsize').value;
  var linksbox = document.getElementById('linksbox').value;
  var checkpage = document.getElementById('checkpage').value;
  chrome.storage.sync.set({
    fontsize: fontsize,
    linksbox: linksbox,
    checkpage: checkpage
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.style="display:block;";
    status.textContent = 'Изменения сохранены.';
    setTimeout(function() {
      status.textContent = '';
      status.style="display:none";
    }, 1750);
  });
}

function default_options() {

  if (!confirm("Уверены что хотите вернуть настройки по умолчанию?")) return false;

    chrome.storage.sync.clear(function(items) {
      chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id, function() { });
    });
  });

}


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    fontsize: '16',
    linksbox: '',
    checkpage: 0
  }, function(items) {
    document.getElementById('fontsize').value = items.fontsize;
    document.getElementById('linksbox').value = items.linksbox;
    document.getElementById('checkpage').value = items.checkpage;
  });
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('default').addEventListener('click',
    default_options);



