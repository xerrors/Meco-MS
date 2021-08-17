// from: https://bl.ocks.org/redgeoff/eadebc99521bc4ff7457f8587df6a6e0

var PasteImage = function (el) {
    this._el = el;
    this._listenForPaste();
  };

  PasteImage.prototype._getURLObj = function () {
    return window.URL || window.webkitURL;
  };

  PasteImage.prototype._pasteImage = function (image) {
    this.emit('paste-image', image);
  };

  PasteImage.prototype._pasteImageFile = function (imageFile) {
    this.emit('paste-image-file', imageFile);
  };

  PasteImage.prototype._pasteImageSource = function (src) {
    var self = this,
      image = new Image();

    image.onload = function () {
      self._pasteImage(image);
    };

    image.src = src;
  };

  PasteImage.prototype._onPaste = function (e) {

    // We need to check if event.clipboardData is supported (Chrome & IE)
    if (e.clipboardData && e.clipboardData.items) {

      // Get the items from the clipboard
      var items = e.clipboardData.items ;

      // Loop through all items, looking for any kind of image
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // We need to represent the image as a file
          var blob = items[i].getAsFile();
          this._pasteImageFile(blob);

          // Use a URL or webkitURL (whichever is available to the browser) to create a
          // temporary URL to the object
          // var URLObj = this._getURLObj();
          // var source = URLObj.createObjectURL(blob);

          // // The URL can then be used as the source of an image
          // this._pasteImageSource(source);

          // Prevent the image (or URL) from being pasted into the contenteditable element
          e.preventDefault();
        }
      }
    }
  };

  PasteImage.prototype._listenForPaste = function () {
    var self = this;

    self._origOnPaste = self._el.onpaste;

    self._el.addEventListener('paste', function (e) {

      self._onPaste(e);

      // Preserve an existing onpaste event handler
      if (self._origOnPaste) {
        self._origOnPaste.apply(this, arguments);
      }

    });
  };

  // TODO: use EventEmitter instead
  PasteImage.prototype.on = function (event, callback) {
    this._callback = callback;
  };

  // TODO: use EventEmitter instead
  PasteImage.prototype.emit = function (event, arg) {
    this._callback(arg);
  };


  export default PasteImage;