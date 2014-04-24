

// https://github.com/GoogleChrome/chrome-app-samples/blob/master/gdrive/js/gdocs.js
function getAudioFiles(token, cb) {
    var url = 'https://www.googleapis.com/drive/v2/files?q=fullText contains \'jpg\'';
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onload = function () {
        if (this.status === 401) {
            console.error('Will remove auth token');
            chrome.identity.removeCachedAuthToken({'token': token});
            return;
        }

        cb(this.status, xhr.responseText);
    }

    xhr.send();
}
  // upgrade polymer-body last so that it can contain other imported elements
  document.addEventListener('polymer-ready', function() {
    
    Polymer('polymer-body', Platform.mixin({

      created: function() {
        this.template = document.createElement('template');
        var body = wrap(document).body;
        var c$ = body.childNodes.array();
        for (var i=0, c; (c=c$[i]); i++) {
          if (c.localName !== 'script') {
            this.template.content.appendChild(c);
          }
        }
        // snarf up user defined model
        window.model = this;
      },

      parseDeclaration: function(elementElement) {
        this.lightFromTemplate(this.template);
      }

    }, window.model));

  });

  ;

    Polymer('x-thumbnail', {
        token: '',
        tokenChanged: function (oldVal, newVal) {
            console.log('token changes', oldVal, newVal);
            
            // https://github.com/GoogleChrome/chrome-app-samples/blob/master/gdrive/js/gdocs.js
            var token = newVal;
            var url = 'https://www.googleapis.com/drive/v2/files?q=fullText contains \'jpg\'';
            var xhr = new XMLHttpRequest();

            var fireError = function (token) {
                // fire custom event to listener
                this.fire('on-error', {token: token});
            }.bind(this);
            
            var downloadThumbnails = function (images, cb, elements) {
                var image = images.shift();
                elements = elements || [];

                if (image) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', image.thumbnailLink, true);
                    xhr.responseType = 'blob';
                    xhr.onload = function() {
                        var e = document.createElement('img');
                        e.src = window.webkitURL.createObjectURL(this.response);
                        elements.push(e);
                        downloadThumbnails(images, cb, elements);
                    };
                    xhr.send();
                } else {
                    cb(elements);
                }
            }
            
            var t = this.shadowRoot.querySelector('#thumbnails');

            xhr.open('GET', url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.onload = function () {
                if (this.status === 401) {
                    console.error('Will remove auth token');
                    fireError(token);
                    return;
                } else if ((this.status & 0xC8) !== 200) {
                    console.error('We\'ve got an error', this.status);
                    return;
                }

                // Display thumbnail image
                images = JSON.parse(xhr.responseText).items;
                
                var ul = document.createElement('ul');

                t.appendChild(ul);
                console.log(ul, t);
                downloadThumbnails(images, function(elements) {
                    elements.forEach(function(e) {
                        ul.appendChild(e);
                    });
                });
            }
            xhr.send();
        },
        ready: function() {
            this.shadowRoot.querySelector('#thumbnails').appendChild(document.createElement('div'));
            this.shadowRoot.querySelector('#thumbnails').innerText = 'Loading';
        }
    })
