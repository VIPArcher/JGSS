//=============================================================================
// VIPArcher_Bubble_Message.js
//=============================================================================
/*:
 * @plugindesc VIPArcher_Bubble_Message
 * @author VIPArcher
 *
 * @param BubbleTagName
 * @desc Filename of the tag image used in Bubble Message ( the image file should be put under the catalog "/img/system")
 * @default BubbleTag
 *
 * @param TopMessageReviseY
 * @desc Offset of Y axis for Bubble Message's window when Bubble Message is shown upon characters or events( negetive values are allowed)
 * @default 0
 *
 * @param TopTagReviseY
 * @desc Offset of Y axis for Bubble Message's tag image when Bubble Message is shown upon characters or events( negetive values are allowed)
 * @default 0
 *
 * @param BottomMessageReviseY
 * @desc Offset of Y axis for Bubble Message's window when Bubble Message is shown beyond characters or events( negetive values are allowed)
 * @default 0
 *
 * @param BottomTagReviseY
 * @desc Offset of Y axis for Bubble Message's tag image when Bubble Message is shown beyond characters or events( negetive values are allowed)
 * @default 0
 *
 * @help Insert \BM[ID] in the message command to convert the current message window into a Bubble Message window for events. (also \bm[ID] is valid)
 * Replace "ID" with ID of the event which is wanted to be pointed by the Bubble Message Tag.
 * ( while the number 0 replacing ID means the Bubble Message points to the current event where the message command is)
 * WARNING: be sure that the ID number won't point to a non-existent event!
 *
 * Insert \BMF[ID] in the message command to convert the current message window into a Bubble Message window for the player and the followers. (also \bmf[ID] is valid)
 * Replace "ID" with 0 if Bubble Message is to show upon the player, or with the team No. of the target follower.
 * WARNING: be sure that the ID number won't point to a  non-existent follower!
 *
 * ver 1.0.0 Last updated on 2015/12/19 : https://github.com/VIPArcher/RMMV-JS
 */
(function() {
    var parameters        = PluginManager.parameters('VIPArcher_Bubble_Message');
    var topTagReviseY        = String(parameters['TopTagReviseY']        || '0');
    var bottomTagReviseY     = String(parameters['BottomTagReviseY']     || '0');
    var topMessageReviseY    = String(parameters['TopMessageReviseY']    || '0');
    var bottomMessageReviseY = String(parameters['BottomMessageReviseY'] || '0');
    var bubbleTagName   =   String(parameters['BubbleTagName']  ||  'BubbleTag');
    function Window_Message_Face() {
        this.initialize.apply(this, arguments);
    };
    Window_Message_Face.prototype = Object.create(Window_Base.prototype);
    Window_Message_Face.prototype.constructor = Window_Message_Face;
    Window_Message_Face.prototype.initialize = function(messageWindow) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        this._messageWindow = messageWindow;
        Window_Base.prototype.initialize.call(this, 0, 0, width, height);
        this._faceBitmap = null;
        this.visible = false;
        this.opacity = 0;
    };
    Window_Message_Face.prototype.windowWidth = function() {
        return 180;
    };
    Window_Message_Face.prototype.windowHeight = function() {
        return 180;
    };
    Window_Message_Face.prototype.updateLoading = function() {
        if (this._faceBitmap) {
            if (ImageManager.isReady()) {
                this.drawMessageFace();
                this._faceBitmap = null;
                return false;
            } else { return true; };
        } else { return false; };
    };
    Window_Message_Face.prototype.loadMessageFace = function() {
        this._faceBitmap = ImageManager.loadFace($gameMessage.faceName());
    };
    Window_Message_Face.prototype.drawMessageFace = function() {
        this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, 0);
    };
    Window_Message_Face.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.updateLoading();
        if (this.contentsOpacity < 255) {this.contentsOpacity += 15};
        if (this.move_x >= 0) {
            this.x += 4;
            this.move_x -= 4;
        }
    };
    Window_Message_Face.prototype.setFace = function() {
        this.contents.clear();
        if (!!this._messageWindow && $gameMessage.faceName() != '') {
            this.loadMessageFace();
            this.setPosition();
            this.show();
            this.open();
        } else { this.hide(); };
    };
    Window_Message_Face.prototype.setPosition = function() {
        this.y = this._messageWindow.height - this.windowHeight();
        this.contentsOpacity = 0;
        if (this.face_name != $gameMessage.faceName() || this.face_index != $gameMessage.faceIndex()){
            if (!!this._messageWindow._event_pop_id || this._messageWindow._event_pop_id === 0) {
                this.x = - 60;
                this.move_x = 60;
            };
            this.face_name = $gameMessage.faceName();
            this.face_index = $gameMessage.faceIndex();
        };
    };
    var _messageWindowUpdateOpen = Window_Message.prototype.updateOpen;
    Window_Message.prototype.updateOpen = function() {
        if (SceneManager._scene.constructor === Scene_Map) {
            if (this._opening) {
                this.openness += 32;
                if (this.isOpen()) {
                    this._opening = false;
                    if (this._messageBubbleTag._isShow) {
                        this._messageBubbleTag.visible = true;
                        this._messageBubbleTag._isShow = false;
                    };
                };
            };
        } else{
            _messageWindowUpdateOpen.call(this);
        };
    };
    var _messageWindowClose = Window_Message.prototype.close;
    Window_Message.prototype.close = function() {
        _messageWindowClose.call(this);
        if (SceneManager._scene.constructor === Scene_Map) {
            this._messageBubbleTag.visible = false;
            this._faceWindow.contents.clear();
            this._faceWindow.close();
        };
    };
    var _messageWindowInitialize = Window_Message.prototype.initialize
    Window_Message.prototype.initialize = function() {
        _messageWindowInitialize.call(this);
        this._faceWindow = new Window_Message_Face(this);
        this.addChild(this._faceWindow);
    };
    var _messageWindowUpdate = Window_Message.prototype.update
    Window_Message.prototype.update = function() {
        _messageWindowUpdate.call(this);
        if (this._faceWindow) {this._faceWindow.update()};
    };
    var _createMessageWindowBubbleTag = Scene_Map.prototype.createMessageWindow
    Scene_Map.prototype.createMessageWindow = function() {
        _createMessageWindowBubbleTag.call(this);
        var bubbleTag = new Sprite();
        bubbleTag.bitmap = ImageManager.loadSystem(bubbleTagName);
        this._messageWindow._messageBubbleTag = bubbleTag;
        this.addChild(bubbleTag);
        this._messageWindow._messageBubbleTag.visible = false;
    };
    var _convertEscapeCharacters = Window_Message.prototype.convertEscapeCharacters;
    Window_Message.prototype.convertEscapeCharacters = function(text) {
        this.resetWindowMessage();
        text = _convertEscapeCharacters.call(this,text);
        text = text.replace(/\x1bBM\[(\d+)\]/gi, function() {
            return this.event_pop_message_setup(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bBMF\[(\d+)\]/gi, function() {
            return this.event_pop_message_setup(parseInt(arguments[1]), true);
        }.bind(this));
        text = text.replace(/\x1bCBM/gi, function() {
            return this.event_pop_message_setup(false, true);
        }.bind(this));
        return text;
    };
    var _updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        if (SceneManager._scene.constructor === Scene_Map) {
            if (this._event_pop_id === 0){
                this._character = !!this._follower ? $gamePlayer : $gameMap.event($gameMap._interpreter.eventId());
                this.popSetPopPlacement(this._character);
            } else if(this._event_pop_id > 0){
                if (!!this._follower){
                    this._character = $gamePlayer.followers().follower(this._event_pop_id - 1);
                } else {
                    this._character = $gameMap.event(this._event_pop_id);
                };  this.popSetPopPlacement(this._character);
            } else {
                _updatePlacement.call(this);
            };
        } else {
            _updatePlacement.call(this);
        };
        if (this._faceWindow) {
            this._faceWindow.setFace();
        };
    };
    Window_Message.prototype.resetWindowMessage = function(){
        this.x = 0;
        this._follower = false;
        this._character = false;
        this._event_pop_id = false;
        this.width  = this.windowWidth();
        this.height = this.windowHeight();
    }
    Window_Message.prototype.event_pop_message_setup = function(event_id, follower) {
        if (follower && !$gamePlayer.followers().follower(event_id - 1)) {
            this._event_pop_id = follower ? 0 : false;
            this._follower = true;
        } else {
            this._event_pop_id = event_id;
            this._follower = follower;
        }; return "";
    };
    Window_Message.prototype.popSetPopPlacement = function(character) {
        this.popcaltextStateHW($gameMessage.allText());
        this._messageBubbleTag._isShow = true;
        var x = character.screenX() - this.width / 2;
        var endX = character.screenX() + this.width / 2;
        this.x = x > 0 ? x : 0;
        if(endX > Graphics.boxWidth){ this.x = Graphics.boxWidth - this.width};
        this._bubblePosTag = character.screenY() > Graphics.boxHeight / 2 ? true : false;
        if (this._bubblePosTag) {
            this.y = character.screenY() - this.height - 60 + parseInt(topMessageReviseY);
            this._messageBubbleTag.y = character.screenY() - 65 + parseInt(topTagReviseY);
        } else{
            this.y = character.screenY() + 14 + parseInt(bottomMessageReviseY);
            this._messageBubbleTag.y = character.screenY() + parseInt(bottomTagReviseY);
        };
        this.setBubbleTag(character);
    };
    Window_Message.prototype.setBubbleTag = function(character) {
        var width = this._messageBubbleTag.width;
        var height = this._messageBubbleTag.bitmap.height / 2;
        var y = !this._bubblePosTag ? height : 0;
        this._opening = true;
        this._messageBubbleTag.setFrame(0 ,y ,width ,height);
        this._messageBubbleTag.x = character.screenX() - width / 2;
    };
    Window_Message.prototype.popcaltextStateHW = function(text) {
        var leftX = $gameMessage.faceName() === '' ? 0 : 172;
        var textState = { index: 0, x: leftX, y: 0, width: 0, left: leftX };
        textState.text = this.convertEscapeCharacters(text);
        textState.y = this.calcTextHeight(textState, false);
        while (textState.index < textState.text.length) {
            this.popReadCharacter(textState);
        };
        this.resetFontSettings();
        this.height = textState.height + 36;
        this.width  = textState.width  + 36;
    };
    Window_Message.prototype.popReadCharacter = function(textState) {
        switch (textState.text[textState.index]) {
        case '\n':
            textState.x = textState.left;
            textState.y += this.calcTextHeight(textState, false);
            textState.index++;
            break;
        case '\f':
             textState.index++;
            break;
        case '\x1b':
            switch (this.obtainEscapeCode(textState)){
            case 'C':
                this.obtainEscapeParam(textState);
                break;
            case 'I':
                this.obtainEscapeParam(textState);
                textState.x += Window_Base._iconWidth + 4;
                break;
            case '{':
                if (this.contents.fontSize <= 96) { this.contents.fontSize += 12; };
                break;
            case '}':
                if (this.contents.fontSize >= 24) { this.contents.fontSize -= 12; };
                break;
            };
            break;
        default:
            textState.x += this.textWidth(textState.text[textState.index++]);
            textState.width = textState.width > textState.x ? textState.width : textState.x;
            textState.height = textState.height > textState.y ? textState.height : textState.y;
            break;
        };
    };
    var _drawMessageFace = Window_Message.prototype.drawMessageFace;
    Window_Message.prototype.drawMessageFace = function(){};
})();