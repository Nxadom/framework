// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  // React Native Components (with JSX template)
  var reactNativeComponents = [
    { text: "View", displayText: "View", snippet: "<View></View>" },
    { text: "Text", displayText: "Text", snippet: "<Text></Text>" },
    { text: "ScrollView", displayText: "ScrollView", snippet: "<ScrollView></ScrollView>" },
    { text: "FlatList", displayText: "FlatList", snippet: '<FlatList data={[]} renderItem={() => {}} />' },
    { text: "SectionList", displayText: "SectionList", snippet: '<SectionList sections={[]} renderItem={() => {}} />' },
    { text: "Image", displayText: "Image", snippet: '<Image source={{}} />' },
    { text: "ImageBackground", displayText: "ImageBackground", snippet: '<ImageBackground source={{}}></ImageBackground>' },
    { text: "TextInput", displayText: "TextInput", snippet: '<TextInput />' },
    { text: "TouchableOpacity", displayText: "TouchableOpacity", snippet: "<TouchableOpacity></TouchableOpacity>" },
    { text: "TouchableHighlight", displayText: "TouchableHighlight", snippet: "<TouchableHighlight></TouchableHighlight>" },
    { text: "TouchableWithoutFeedback", displayText: "TouchableWithoutFeedback", snippet: "<TouchableWithoutFeedback></TouchableWithoutFeedback>" },
    { text: "Pressable", displayText: "Pressable", snippet: "<Pressable></Pressable>" },
    { text: "Button", displayText: "Button", snippet: '<Button title="" onPress={() => {}} />' },
    { text: "Switch", displayText: "Switch", snippet: '<Switch value={false} onValueChange={() => {}} />' },
    { text: "ActivityIndicator", displayText: "ActivityIndicator", snippet: '<ActivityIndicator />' },
    { text: "Modal", displayText: "Modal", snippet: "<Modal></Modal>" },
    { text: "StatusBar", displayText: "StatusBar", snippet: '<StatusBar />' },
    { text: "RefreshControl", displayText: "RefreshControl", snippet: '<RefreshControl refreshing={false} onRefresh={() => {}} />' },
    { text: "SafeAreaView", displayText: "SafeAreaView", snippet: "<SafeAreaView></SafeAreaView>" },
    { text: "KeyboardAvoidingView", displayText: "KeyboardAvoidingView", snippet: "<KeyboardAvoidingView></KeyboardAvoidingView>" }
  ];

  // React Hooks (simple text)
  var reactHooks = [
    "useState", "useEffect", "useContext", "useReducer",
    "useCallback", "useMemo", "useRef", "useImperativeHandle",
    "useLayoutEffect", "useDebugValue"
  ];

  // Common React/JSX keywords (simple text)
  var reactKeywords = [
    "props", "state", "setState", "render", "component",
    "className", "style", "key", "ref", "children"
  ];

  // StyleSheet methods (simple text)
  var styleSheetMethods = [
    "StyleSheet.create", "StyleSheet.flatten", "StyleSheet.compose"
  ];

  // Common JSX/React Native attributes
  var jsxAttributes = [
    { text: 'style={}', displayText: 'style', snippet: 'style={}' },
    { text: 'className=""', displayText: 'className', snippet: 'className=""' },
    { text: 'key=""', displayText: 'key', snippet: 'key=""' },
    { text: 'ref={}', displayText: 'ref', snippet: 'ref={}' },
    { text: 'onPress={() => {}}', displayText: 'onPress', snippet: 'onPress={() => {}}' },
    { text: 'onLayout={() => {}}', displayText: 'onLayout', snippet: 'onLayout={() => {}}' },
    { text: 'onScroll={() => {}}', displayText: 'onScroll', snippet: 'onScroll={() => {}}' },
    { text: 'onChange={() => {}}', displayText: 'onChange', snippet: 'onChange={() => {}}' },
    { text: 'onChangeText={() => {}}', displayText: 'onChangeText', snippet: 'onChangeText={() => {}}' },
    { text: 'onSubmitEditing={() => {}}', displayText: 'onSubmitEditing', snippet: 'onSubmitEditing={() => {}}' },
    { text: 'source={}', displayText: 'source', snippet: 'source={}' },
    { text: 'data={}', displayText: 'data', snippet: 'data={}' },
    { text: 'renderItem={() => {}}', displayText: 'renderItem', snippet: 'renderItem={() => {}}' },
    { text: 'keyExtractor={() => {}}', displayText: 'keyExtractor', snippet: 'keyExtractor={() => {}}' },
    { text: 'placeholder=""', displayText: 'placeholder', snippet: 'placeholder=""' },
    { text: 'value={}', displayText: 'value', snippet: 'value={}' },
    { text: 'defaultValue={}', displayText: 'defaultValue', snippet: 'defaultValue={}' },
    { text: 'title=""', displayText: 'title', snippet: 'title=""' },
    { text: 'disabled={}', displayText: 'disabled', snippet: 'disabled={}' },
    { text: 'numberOfLines={}', displayText: 'numberOfLines', snippet: 'numberOfLines={}' },
    { text: 'testID=""', displayText: 'testID', snippet: 'testID=""' }
  ];

  function getReactCompletions(token, context) {
    var word = token.string.toLowerCase();
    var completions = [];

    // Check React Native Components (with snippets)
    for (var i = 0; i < reactNativeComponents.length; i++) {
      var comp = reactNativeComponents[i];
      if (comp.text.toLowerCase().indexOf(word) === 0) {
        completions.push(comp);
      }
    }

    // Check other completions (simple text)
    var simpleCompletions = reactHooks.concat(reactKeywords).concat(styleSheetMethods);
    for (var j = 0; j < simpleCompletions.length; j++) {
      var simple = simpleCompletions[j];
      if (simple.toLowerCase().indexOf(word) === 0) {
        completions.push({ text: simple, displayText: simple });
      }
    }

    return completions;
  }

  function reactHint(editor, options) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var line = editor.getLine(cur.line);
    var start = token.start;
    var end = cur.ch;
    var word = token.string;

    // Check if we're inside a JSX tag (after < and before >)
    var textBeforeCursor = line.substring(0, cur.ch);
    var lastOpenBracket = textBeforeCursor.lastIndexOf('<');
    var lastCloseBracket = textBeforeCursor.lastIndexOf('>');
    var insideJSXTag = lastOpenBracket > lastCloseBracket && lastOpenBracket !== -1;

    // If inside JSX tag, show attribute completions
    if (insideJSXTag) {
      var attributeCompletions = [];
      var lowerWord = word.toLowerCase();
      
      for (var i = 0; i < jsxAttributes.length; i++) {
        var attr = jsxAttributes[i];
        if (attr.displayText.toLowerCase().indexOf(lowerWord) === 0) {
          attributeCompletions.push(attr);
        }
      }

      if (attributeCompletions.length > 0) {
        var attributeHints = attributeCompletions.map(function(attr) {
          return {
            text: attr.snippet,
            displayText: attr.displayText,
            hint: function(cm, data, completion) {
              var from = data.from;
              var to = data.to;
              var snippet = completion.text;
              
              cm.replaceRange(snippet, from, to);
              
              // Calculate cursor position
              var cursorOffset = 0;
              if (snippet.indexOf('=""') !== -1) {
                cursorOffset = snippet.indexOf('=""') + 2; // Inside quotes
              } else if (snippet.indexOf('={}') !== -1) {
                cursorOffset = snippet.indexOf('={}') + 2; // Inside braces
              } else if (snippet.indexOf('={() => {}}') !== -1) {
                cursorOffset = snippet.indexOf('={() => {}}') + 9; // Inside function body
              } else {
                cursorOffset = snippet.length;
              }
              
              cm.setCursor({ line: from.line, ch: from.ch + cursorOffset });
              cm.focus();
            }
          };
        });

        return {
          list: attributeHints,
          from: CodeMirror.Pos(cur.line, start),
          to: CodeMirror.Pos(cur.line, end)
        };
      }
    }

    // Only show component hints for word tokens outside JSX tags
    if (token.type != "variable" && token.type != null) {
      return null;
    }

    // Get component completions
    var completions = getReactCompletions(token, editor);

    if (completions.length === 0) {
      return null;
    }

    // Convert completions to CodeMirror hint format
    var hints = completions.map(function(completion) {
      if (typeof completion === "string") {
        return completion;
      } else if (completion.snippet) {
        // For snippets, create a hint object with custom insert behavior
        return {
          text: completion.snippet,
          displayText: completion.displayText,
          hint: function(cm, data, completion) {
            var from = data.from;
            var to = data.to;
            var snippet = completion.text;
            
            // Replace current word with snippet
            cm.replaceRange(snippet, from, to);
            
            // Calculate cursor position
            var cursorOffset = 0;
            
            // For self-closing tags with attributes, cursor goes in the middle of attributes
            if (snippet.indexOf('=""') !== -1) {
              cursorOffset = snippet.indexOf('=""') + 2; // Inside the quotes
            }
            // For self-closing tags, cursor goes before />
            else if (snippet.indexOf("/>") !== -1) {
              cursorOffset = snippet.indexOf(">"); // Right before >
            }
            // For paired tags, cursor goes between opening and closing tags
            else if (snippet.indexOf("></") !== -1) {
              cursorOffset = snippet.indexOf("></") + 1; // After >
            }
            // Fallback: place cursor at end
            else {
              cursorOffset = snippet.length;
            }
            
            // Set cursor with proper position
            cm.setCursor({ line: from.line, ch: from.ch + cursorOffset });
            
            // Focus the editor
            cm.focus();
          }
        };
      } else {
        return {
          text: completion.text,
          displayText: completion.displayText
        };
      }
    });

    return {
      list: hints,
      from: CodeMirror.Pos(cur.line, start),
      to: CodeMirror.Pos(cur.line, end)
    };
  }

  CodeMirror.registerHelper("hint", "react", reactHint);
  CodeMirror.registerHelper("hint", "javascript", reactHint);
});
