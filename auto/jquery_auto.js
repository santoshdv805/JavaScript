/**
 * Plugin Name: Autocomplete for Textarea
 * Author: Amir Harel
 * Copyright: amir harel (harel.amir1@gmail.com)
 * Twitter: @amir_harel
 * Version 1.4
 * Published at : http://www.amirharel.com/2011/03/07/implementing-autocomplete-jquery-plugin-for-textarea/
 */
var shiftPressed=0;
var autoCompleteList = [];
var sqlOperatorFun=[];
var showSuggestionFor=false;
var selectedField=null;
var fieldDetails;
var prevQuery;
var textAreaId;
var defaultValues;
var listVisible;
var conditionalList=[];
var SQL_FUNCTIONS = ['ABS', 'AVG', 'COUNT', 'MIN', 'MAX', 'SUM','IN', 'NOT IN', 'ANY', 'ALL', 'SOME','EXISTS'];

(function($){
	/**
	 * @param obj
	 * 	@attr wordCount {Number} the number of words the user want to for matching it with the dictionary
	 *	@attr mode {String} set "outter" for using an autocomplete that is being displayed in the outter layout of the textarea, as opposed to inner display
	 * 	@attr on {Object} containing the followings:
	 * 		@attr query {Function} will be called to query if there is any match for the user input
	 */
	$.fn.autocomplete = function(obj){
		//if( typeof $.browser.msie != 'undefined' ) obj.mode = 'outter';
		this.each(function(index,element){
			if( element.nodeName == 'TEXTAREA' ){
				makeAutoComplete(element,obj);
			}
		});		
	}
	
	//var browser =  {isChrome: $.browser.webkit };
	
	function getDefaultCharArray(){
		return  {
		'`':0,
		'~':0,
		'1':0,
		'!':0,
		'2':0,
		'@':0,
		'3':0,
		'#':0,
		'4':0,
		'$':0,
		'5':0,
		'%':0,
		'6':0,
		'^':0,
		'7':0,
		'&':0,
		'8':0,
		'*':0,
		'9':0,
		'(':0,
		'0':0,
		')':0,
		'-':0,
		'_':0,
		'=':0,
		'+':0,
		'q':0,
		'Q':0,
		'w':0,
		'W':0,
		'e':0,
		'E':0,
		'r':0,
		'R':0,
		't':0,
		'T':0,
		'y':0,
		'Y':0,
		'u':0,
		'U':0,
		'i':0,
		'I':0,
		'o':0,
		'O':0,
		'p':0,
		'P':0,
		'[':0,
		'{':0,
		']':0,
		'}':0,
		'a':0,
		'A':0,
		's':0,
		'S':0,
		'd':0,
		'D':0,
		'f':0,
		'F':0,
		'g':0,
		'G':0,
		'h':0,
		'H':0,
		'j':0,
		'J':0,
		'k':0,
		'K':0,
		'l':0,
		'L':0,
		';':0,
		':':0,
		'\'':0,
		'"':0,
		'\\':0,
		'|':0,
		'z':0,
		'Z':0,
		'x':0,
		'X':0,
		'c':0,
		'C':0,
		'v':0,
		'V':0,
		'b':0,
		'B':0,
		'n':0,
		'N':0,
		'm':0,
		'M':0,
		',':0,
		'<':0,
		'.':0,
		'>':0,
		'/':0,
		'?':0,
		' ':0
		};
	}
	
		
	function setCharSize(data){
		for( var ch in data.chars ){
			if( ch == ' ' ) $(data.clone).html("<span id='test-width_"+data.id+"' style='line-block'>&nbsp;</span>");
			else $(data.clone).html("<span id='test-width_"+data.id+"' style='line-block'>"+ch+"</span>");
			var testWidth = $("#test-width_"+data.id).width();
			data.chars[ch] = testWidth;
		}		
	}
	
	var _data = {};
	var _count = 0;
	function makeAutoComplete(ta,obj){
		_count++;
		_data[_count] = {
			id:"auto_"+_count,
			ta:ta,
			wordCount:obj.wordCount,
			on:obj.on,
			clone:null,
			lineHeight:0,
			list:null,
			charInLines:{},
			mode:obj.mode,
			chars:getDefaultCharArray()};
			
		var clone = createClone(_count);
		_data[_count].clone = clone;
		setCharSize(_data[_count]);
		//_data[_count].lineHeight = $(ta).css("font-size");
		_data[_count].list = createList(_data[_count]);	
		registerEvents(_data[_count]);	
	}
	
	function createList(data){
		var ul = document.createElement("ul");
		$(ul).addClass("auto-list");
		$(ul).css({"position":"absolute","z-index":1000});
		document.body.appendChild(ul);
		return ul;
	}
	
	function createClone(id){
		var data = _data[id];
		var div = document.createElement("div");
		var offset = $(data.ta).offset();
		offset.top = offset.top - parseInt($(data.ta).css("margin-top"));
		offset.left = offset.left - parseInt($(data.ta).css("margin-left"));
		$(div).css({
			position:"absolute",
			top: offset.top,
			left: offset.left,
			"border-collapse" : $(data.ta).css("border-collapse"),
			"border-bottom-style" : $(data.ta).css("border-bottom-style"),
			"border-bottom-width" : $(data.ta).css("border-bottom-width"),			
			"border-left-style" : $(data.ta).css("border-left-style"),
			"border-left-width" : $(data.ta).css("border-left-width"),
			"border-right-style" : $(data.ta).css("border-right-style"),
			"border-right-width" : $(data.ta).css("border-right-width"),
			"border-spacing" : $(data.ta).css("border-spacing"),
			"border-top-style" : $(data.ta).css("border-top-style"),
			"border-top-width" : $(data.ta).css("border-top-width"),
			"direction" : $(data.ta).css("direction"),
			"font-size-adjust" : $(data.ta).css("font-size-adjust"),
			"font-size" : $(data.ta).css("font-size"),
			"font-stretch" : $(data.ta).css("font-stretch"),
			"font-style" : $(data.ta).css("font-style"),
			"font-family" : $(data.ta).css("font-family"),
			"font-variant" : $(data.ta).css("font-variant"),
			"font-weight" : $(data.ta).css("font-weight"),
			"width" : $(data.ta).css("width"),
			"height" : $(data.ta).css("height"),
			"letter-spacing" : $(data.ta).css("letter-spacing"),
			"margin-bottom" : $(data.ta).css("margin-bottom"),
			"margin-top" : $(data.ta).css("margin-top"),
			"margin-right" : $(data.ta).css("margin-right"),
			"margin-left" : $(data.ta).css("margin-left"),
			"padding-bottom" : $(data.ta).css("padding-bottom"),
			"padding-top" : $(data.ta).css("padding-top"),
			"padding-right" : $(data.ta).css("padding-right"),
			"padding-left" : $(data.ta).css("padding-left"),
			"overflow-x" : "hidden",
			"line-height" :  $(data.ta).css("line-height"),
			"overflow-y" : "hidden",
			"z-index" : -10					
		});
		
		//i don't know why by chrome adds some pixels to the clientWidth...
		data.chromeWidthFix = (data.ta.clientWidth - $(data.ta).width());
		data.lineHeight = $(data.ta).css("line-height");
		if( isNaN(parseInt(data.lineHeight)) ) data.lineHeight = parseInt($(data.ta).css("font-size"))+2;
				
		document.body.appendChild(div);
		return div;		
	}
	
	
	
	function getWords(data){
		var selectionEnd = getTextAreaSelectionEnd(data.ta);//.selectionEnd;
		var text = data.ta.value;
		text = text.substr(0,selectionEnd);
		if( text.charAt(text.length-1) == ' ' || text.charAt(text.length-1) == '\n' ) return "";
		var ret = [];
		var wordsFound = 0;
		var pos = text.length-1;
		while( wordsFound < data.wordCount && pos >= 0 && text.charAt(pos) != '\n'){
			ret.unshift(text.charAt(pos));
			pos--;
			if( text.charAt(pos) == ' ' || pos < 0 ){
				wordsFound++;
			}
		}
		return ret.join("");		
	}
	
	
	function showList(data,list,text){
		debugger
		if( !listVisible ){
			listVisible = true;
			var pos = getCursorPosition(data);
			$(data.list).css({
				left: pos.left+"px",
				top: pos.top+"px",
				display: "block"
			});
		}		
		
		var html = "";
		var regEx = new RegExp("("+text+")");
		var taWidth = $(data.ta).width()-5;
		//var width = data.mode == "outter" ? "style='width:"+taWidth+"px;'" : "";
		var width = data.mode == "outter" ? "style='width:auto;'" : "";
		for( var i=0; i< list.length; i++ ){
			
			//var a = list[i].replace(regEx,"<mark>$1</mark>");
			 
			if(findInArray(SQL_FUNCTIONS, list[i])){
				html += "<li data-value='"+list[i]+"' "+width+" style='font-style:italic;color:black;'>"+list[i].replace(regEx,"<mark>$1</mark>")+"</li>";
			}else
				html += "<li data-value='"+list[i]+"' "+width+">"+list[i].replace(regEx,"<mark>$1</mark>")+"</li>";
		}
		$(data.list).html(html);
	}	
	
	function breakLines(text,data){
		var lines = [];
		
		var width = $(data.clone).width();
		
		var line1 = "";
		var line1Width = 0;
		var line2Width = 0;
		var line2 = "";
		var chSize = data.chars;
		
		
		var len = text.length;
		for( var i=0; i<len; i++){
			var ch = text.charAt(i);
			line2 += ch.replace(" ","&nbsp;");
			var size = (typeof chSize[ch] == 'undefined' ) ? 0 : chSize[ch];
			line2Width += size;
			if( ch == ' '|| ch == '-' ){
				if( line1Width + line2Width < width-1 ){
					line1 = line1 + line2;
					line1Width = line1Width + line2Width;
					line2 = "";
					line2Width = 0;
				}
				else{
					lines.push(line1);
					line1= line2;
					line1Width = line2Width;
					line2= "";
					line2Width = 0;
				}
			}
			if( ch == '\n'){
				if( line1Width + line2Width < width-1 ){
					lines.push(line1 + line2);					
				}
				else{
					lines.push(line1);
					lines.push(line2);					
				}
				line1 = "";
				line2 = "";
				line1Width = 0;
				line2Width = 0;
			}
			//else{
				//line2 += ch;	
			//}			
		}
		if( line1Width + line2Width < width-1 ){
			lines.push(line1 + line2);			
		}
		else{
			lines.push(line1);
			lines.push(line2);
		}
		return lines;
	}
	
	
	
	
	function getCursorPosition(data){
		/*if( data.mode == "outter" ){
			return getOuterPosition(data);
		}*/
		if( browser.isChrome ){
			$(data.clone).width(data.ta.clientWidth-data.chromeWidthFix);
		}
		else{
			$(data.clone).width(data.ta.clientWidth);
		}
		
		
		var ta = data.ta;
		var selectionEnd = getTextAreaSelectionEnd(data.ta);
		var text = ta.value;//.replace(/ /g,"&nbsp;");
		
		var subText = text.substr(0,selectionEnd);
		var restText = text.substr(selectionEnd,text.length);
		
		var lines = breakLines(subText,data);//subText.split("\n");
		var miror = $(data.clone);
		miror.html("");
		for( var i=0; i< lines.length-1; i++){
			miror.append("<div style='height:"+(parseInt(data.lineHeight))+"px"+";'>"+lines[i]+"</div>");
		}
		miror.append("<span id='"+data.id+"' style='display:inline-block;'>"+lines[lines.length-1]+"</span>");
		
		miror.append("<span id='rest' style='max-width:'"+data.ta.clientWidth+"px'>"+restText.replace(/\n/g,"<br/>")+"&nbsp;</span>");
		
		miror.get(0).scrollTop = ta.scrollTop;
		
		var span = miror.children("#"+data.id);
		var offset = span.offset();
		var obj={top:offset.top+span.height(),left:offset.left+span.width()};
		return obj;
		
	}
	
	function getOuterPosition(data){
		var offset = $(data.ta).offset();
		return {top:offset.top+$(data.ta).height()+8,left:offset.left};
	}
	
	function hideList(data){
		if( listVisible ){
			$(data.list).css("display","none");
			listVisible = false;
		}
	}
	
	function setSelected(dir,data){
		var selected = $(data.list).find("[data-selected=true]");
		if( selected.length != 1 ){
			if( dir > 0 ) $(data.list).find("li:first-child").attr("data-selected","true");
			else $(data.list).find("li:last-child").attr("data-selected","true");
			return;
		}
//		if(selected.length == 1){
//			setSelected(+1,data);
//		}
		selected.attr("data-selected","false");
		if( dir > 0 ){
			var next= selected.next();
			if(next.length==0)
				$(data.list).find("li:first-child").attr("data-selected","true");
			else
				selected.next().attr("data-selected","true");	
		}else{
			var prev= selected.prev();
			if(prev.length==0){
				$(data.list).find("li:last-child").attr("data-selected","true");
			}else
				prev.attr("data-selected","true");
		}
		
	}
	
	function getCurrentSelected(data){
		var selected = $(data.list).find("[data-selected=true]");
		if( selected.length == 1) return selected.get(0);
		return null;
	}
	
	function onUserSelected(li,data){
		var isFun=false;
		var seletedText = $(li).attr("data-value");
		
		var selectionEnd = getTextAreaSelectionEnd(data.ta);//.selectionEnd;
		var text = data.ta.value;
		text = text.substr(0,selectionEnd);
		var wordsFound = 0;
		var pos = text.length-1;
		
		while( wordsFound < data.wordCount && pos >= 0 && text.charAt(pos) != '\n'){
			pos--;
			if( text.charAt(pos) == ' ' || pos < 0 ){
				wordsFound++;
			}
		}
		var a = data.ta.value.substr(0,pos+1);
		var c = data.ta.value.substr(selectionEnd,data.ta.value.length).trim();
		if(c.charAt(0)=="'"){
			c=c.substring(1,c.length);
		}
		
		
		
		if(fieldDetails[seletedText]=='STRING'  || fieldDetails[seletedText]=='NUMBER'){
			var res=data.ta.value;
			var subString=res.substring(0, selectionEnd);
			var count = (subString.match(/'/g) || []).length;
			if(count%2==1)
				subString=subString+"'";
			res=SQLParser.lexer.tokenize(subString);
			if(res.length>=1 && res[res.length-4]!=null && res[res.length-4][1].toLowerCase()=='abs'){
				pos=pos+2;
			}
			selectedField="";
			showSuggestionFor='Operator';// if field selected then show suggestion of SQL operator
			seletedText=seletedText +" ";
		}else if(fieldDetails[seletedText]=='Conditional'){
			showSuggestionFor='Fields';
			selectedField="";// reset selected field to show next all suggestion of fields
			seletedText=seletedText +" ";
		}else if(fieldDetails[seletedText]=='Operator'){
			showSuggestionFor='Fields';
			var prev=$.trim(a);
			if(prev.length>1){// to show suggestion for field  
				var fields=prev.split(" ");
				selectedField=fields.length>0?fields[fields.length-1]:"";
			}
			seletedText=seletedText +" ";
		}else if(findInArray(SQL_FUNCTIONS, seletedText)){
			if(seletedText=='ABS'){
				var next =$.trim(c);
				if(next!=null && next.length>1 && next.charAt(0)=="("){//if parenthesis allready exist no need to append parenthesis 
					seletedText=seletedText+" ";
					//isFun=false;
				}else{// else append parenthesis
					seletedText=seletedText +" (  ) ";
					isFun=true;
				}
				//seletedText=seletedText +" (  ) ";
				
				selectedField='ABS';
			}else if(seletedText=='IN' || seletedText=='NOT IN'){
				
				var prev=$.trim(a);
				if(prev.length>1){// to show suggestion for field  
					var fields=prev.split(" ");
					selectedField=fields.length>0?fields[fields.length-1]:"";
				}
				var next =$.trim(c);
				if(next!=null && next.length>1 && next.charAt(0)=="("){//if parenthesis allready exist no need to append parenthesis 
					seletedText=seletedText+" ";
				}else{// else append parenthesis
					seletedText=seletedText +" (  ) ";
					isFun=true;
				}
			}
			
			showSuggestionFor='Fields';
		}else if(showSuggestionFor=='Value'){
			seletedText="'"+seletedText +"' ";
			selectedField="";
			showSuggestionFor='Conditional';
		}else{
			seletedText=seletedText +" ";
		}
		
		var scrollTop = data.ta.scrollTop;
		data.ta.value = a+seletedText+c +" ";
		data.ta.scrollTop = scrollTop;
		hideList(data);
		setSelectionRange(data.ta, isFun?pos+seletedText.length-2:pos+1+seletedText.length, isFun?pos+seletedText.length-2:pos+1+seletedText.length);
		//data.ta.selectionEnd =isFun?pos+seletedText.length-2:pos+1+seletedText.length;
		data.ta.focus();
		if(!listVisible){
			validateSQL(data.ta.value);
		}
	}
	
	function registerEvents(data){
		$(data.list).delegate("li","click",function(e){
			var li = this;
			onUserSelected(li,data);
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		
		
		$(data.ta).on('input', function() {
			//validateSQL(data.ta.value);
		});
		
		$(data.ta).blur(function(e){
			setTimeout(function(){
			hideList(data);	
			validateSQL(data.ta.value);
			},400);
			
		});
		
		$(data.ta).focus(function(e){
			setTimeout(function(){
				displayLineNumber();
			},400);
		});
		
		$(data.ta).click(function(e){
			hideList(data);
			displayLineNumber();
		});
		
		$(data.ta).keydown(function(e){
			var evt = (e==null ? event:e);
			 	shiftPressed=evt.shiftKey;
			// spsce key is to show next suggestion 
			 	if( e.keyCode==32){
					var pos = getTextAreaSelectionEnd(data.ta);
					var res=data.ta.value;
					var subString=res.substring(0, pos);
					var count = (subString.match(/'/g) || []).length;
					if(count%2==1)
						subString=subString+"'";
					subString=$.trim(subString);
					res=SQLParser.lexer.tokenize(subString);
					if(res.length>=2 && res[res.length-2]!=null){
						if(res[res.length-2][0]=='LITERAL'){
							showSuggestionFor='Operator';
						}else if(res[res.length-2][0]=='OPERATOR'){
							showSuggestionFor='Fields';
						}
					}
				}
			 	
			if( listVisible ){
				switch(e.keyCode){
					case 13:
					case 40:
					case 38:
						e.stopImmediatePropagation();
						e.preventDefault();
						return false;
					case 27: //esc
						hideList(data);
				}
				
			}
		});
		
		$(data.ta).keyup(function(e){
			displayLineNumber();
			validateSQL(data.ta.value);
			if( listVisible ){
				
				if( e.keyCode == 40 ){//down key
					setSelected(+1,data);
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;
				}
				if( e.keyCode == 38 ){//up key
					setSelected(-1,data);
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;
				}
				if(e.keyCode == 37 || e.keyCode == 39){// right and left arrow key
					hideList(data);
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;
				}
				if( e.keyCode == 13 ){//enter key
					var li = getCurrentSelected(data);
					if( li ){
						
						e.stopImmediatePropagation();
						e.preventDefault();
						hideList(data);					
						onUserSelected(li,data);						
						return false;	
					}
					hideList(data);					
				}
				if( e.keyCode == 27 ){//escap key
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;	
				}
				
		
			}else{// code added by Santosh Yadav
				if(e.keyCode == 16 || e.keyCode == 17 ){
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;	
				}
				if( e.keyCode == 13 || e.keyCode == 37 || e.keyCode == 39 || (e.keyCode>=48 && e.keyCode<=58) || (e.keyCode>=96 && e.keyCode<=105)){//space bar and enter key 
					/*if(e.keyCode == 32) */
						//validateSQL(data.ta.value);
					if((e.keyCode>=48 && e.keyCode<=58) || (e.keyCode>=96 && e.keyCode<=105)){// for nunber keys
						var pos = getTextAreaSelectionEnd(data.ta);
						var res=data.ta.value;
						var subString=res.substring(0, pos);
						var count = (subString.match(/'/g) || []).length;
						if(count%2==1)
							subString=subString+"'";
						res=SQLParser.lexer.tokenize(subString);
						if(res[res.length-4]!=null && res[res.length-4][1].toLowerCase()=='abs'){// user is typing inside ABS function
							showSuggestionFor='Operator';// then show suggestion for operator
						}else
							showSuggestionFor='Conditional';
					}
						
				}else if(e.keyCode == 8 || e.keyCode == 46){
					//$('#ruleExprnMsg').html('');
					if(data.ta.value!=null || data.ta.value.length>2){
						var pos = getTextAreaSelectionEnd(data.ta);
						var res=data.ta.value;
						var subString=res.substring(0, pos);
						var count = (subString.match(/'/g) || []).length;
						if(count%2==1)
							subString=subString+"'";
						res=SQLParser.lexer.tokenize(subString);
						if(res.length>=2){
							for(var i=res.length-1;i>=0;i--){
								if(res[i][0]=='RIGHT_PAREN'){
									if(res[i-3]!=null && res[i-3][1].toLowerCase()=='abs' && (res[i-4]==null || res[i-4][0]=='CONDITIONAL')){// backspace is before abs function and expression is started  
										showSuggestionFor='Operator';
									}else
										showSuggestionFor='Conditional';
									break;
								}else if(res[i][0]=='LITERAL'){
									if(fieldDetails[res[i][1]]!=null){// if litral is present in field list 
										showSuggestionFor='Operator';selectedField=res[i][1];
									}else if(res[i-1]!=null && (res[i-1][0]=='RIGHT_PAREN' || res[i-1][0]=='NUMBER')){
										if(res[i-4]!=null && res[i-4][1].toLowerCase()=='in'){// if befor backspace is before IN operator
											showSuggestionFor='Conditional';
										}else if(res[i-4]!=null && res[i-4][1]=='ABS' || res[i-5]!=null && res[i-5][0]!='OPERATOR')
											showSuggestionFor='Operator';
										else
											showSuggestionFor='Conditional';
										selectedField=res[i][1];
									}else if((res[i-1]!=null && res[i-1][0]=='OPERATOR') || (res[i-1]!=null && res[i-1][0]=='CONDITIONAL')||(res[i-1]==null && fieldDetails[res[i][1]]==null) ){
										showSuggestionFor='Fields';
										selectedField=res[i-2]!=null?res[i-2][1]:"";
									}else if(res[i-1]!=null && res[i-1][0]=='STRING'){
										showSuggestionFor='Conditional';selectedField=res[i][1];
									}else if(res[i-2]!=null && res[i-2][1].toLowerCase()=='abs'){// if backspace is inside ABS function then show suggestion for fields
										showSuggestionFor='Fields';
										selectedField='ABS';
									}else
										showSuggestionFor='Operator';
									//selectedField=res[i][1];
									break;
								}else if(res[i][0]=='CONDITIONAL'){
									if(res[i][1]=='OR')
										showSuggestionFor='Operator';
									else
										showSuggestionFor='Fields';
									break;
								}else if(res[i][0]=='STRING' || res[i][0]=='NUMBER'){
									if(res[i][0]=='STRING' && res[i-1]!=null){// if suggestion if string
										if( (res[i-1][1]=='=') && res[i-2]!=null){// if before that = operator 
											selectedField=res[i-2][1];// then show suggestion for field before = operator 
										}else if(res[i-1][1]=='(' && res[i-3]!=null){//  if sugestion is in IN operator
											selectedField=res[i-3][1];// then show suggestion for field before IN operator
										}else if(res[i-1][1]==',' ){
											if(subString.lastIndexOf('IN')>-1){// if more than one selected option in IN opertor
												var prev=subString.substring(0, subString.lastIndexOf('IN'));// take substring from 0 to IN position
												prev=$.trim(prev);
												prev=prev.split(" ");
												if(prev.length>=1 && prev[prev.length-1]!=null){// to show suggestion for field  
													selectedField=prev[prev.length-1];
												}
											}
										}
										 
										showSuggestionFor='Value';
									}else
										showSuggestionFor='Conditional';
									break;
								}else if(res[i][0]=='LEFT_PAREN'){
									if(res[i-1]!=null && res[i-1][1]=='ABS'){
										selectedField='ABS';
									}
									showSuggestionFor='Fields';
									break;
								}else if(res[i][0]=='OPERATOR'){
									showSuggestionFor='Value';
									break;
								}else{
									showSuggestionFor='Fields';
								}
							}
							//validateSQL(res);
						}else{
							showSuggestionFor='Fields';
							selectedField='';
						}
						
					}else{
						showSuggestionFor='Fields';
						selectedField='';
						$('#ruleExprnMsg').html('');
					}
					
				}
			}
			switch( e.keyCode ){
				case 27:
					return true;
			}
			
			var text = getWords(data);
			if(text.length==1 && data.ta.value.length==1)
				showSuggestionFor='Fields';
			//console.log("getWords return-->"+text);
			if( text != "" ){
				var selectionEnd = getTextAreaSelectionEnd(data.ta);
				var res=data.ta.value;
				if( (shiftPressed && (e.keyCode==57 || e.keyCode==219))|| e.keyCode==222 || e.keyCode==219 || e.keyCode==188 || e.keyCode==190){
					var splChar=text.substr(text.length-1);
					var setSelectionEnd=null;
					
					switch(splChar){
						case '{':	
							var closeCount=countOcurrences(res,'}');
							var openCount=countOcurrences(res,'{');
							var singleQuoteCount=countOcurrences(res.substring(0, selectionEnd),'\'');
							var doubleQuoteCount=countOcurrences(res.substring(0, selectionEnd),'"');
							if(closeCount!=openCount && (singleQuoteCount%2)==0 && (doubleQuoteCount%2)==0){
								res= res.substring(0, selectionEnd) +"  }" + res.substring(selectionEnd, res.length);							
								setSelectionEnd=selectionEnd+1;
							}
							break;
						case '(':
							var closeCount=countOcurrences(res,'\\)');
							var openCount=countOcurrences(res,'\\(');
							if(closeCount!=openCount){
								res= res.substring(0, selectionEnd) +"  )" + res.substring(selectionEnd, res.length);
								setSelectionEnd=selectionEnd+1;
								showSuggestionFor='Fields';
							}
							break;
						case '[':
							var closeCount=countOcurrences(res,'\\]');
							var openCount=countOcurrences(res,'\\[');
							if(closeCount!=openCount){
								res= res.substring(0, selectionEnd) +"  ]" + res.substring(selectionEnd, res.length);
								setSelectionEnd=selectionEnd+1;
							}
							break;
						case '\'':
							var count=countOcurrences(res,'\'');
							if(count%2!=0){
								if(text.indexOf('>')>-1 || text.indexOf('<')>-1){
									res= res.substring(0, selectionEnd-1) +" ''" + res.substring(selectionEnd, res.length);
									selectionEnd=selectionEnd+1;
								}else
								    res= res.substring(0, selectionEnd) +"'" + res.substring(selectionEnd, res.length);
								setSelectionEnd=selectionEnd;
								showSuggestionFor=='Value';
							}
							break;
						case ',':
							res= res.substring(0, selectionEnd) +" " + res.substring(selectionEnd, res.length);
							setSelectionEnd=selectionEnd+1;
							break;
						case '>':
							//showSuggestionFor='Fields';
							res= res.substring(0, selectionEnd);
							var prev=$.trim(res);
							if(prev.length>1){// to show suggestion for field  
								var fields=prev.split(" ");
								selectedField=fields.length>0?fields[fields.length-2]:"";
								selectedField=$.trim(selectedField);
							}
							break;
						case '<':
							//showSuggestionFor='Fields';
							res= res.substring(0, selectionEnd);
							var prev=$.trim(res);
							if(prev.length>1){// to show suggestion for field  
								var fields=prev.split(" ");
								selectedField=fields.length>0?fields[fields.length-2]:"";
								selectedField=$.trim(selectedField);
							}
							break;
						case ' ':// to show sujjestion after space bar
							res= res.substring(0, selectionEnd);
							var prev=$.trim(res);
							if(prev.length>1){// to show suggestion for field  
								var fields=prev.split(" ");
								selectedField=fields.length>0?fields[fields.length-2]:"";
								selectedField=$.trim(selectedField);
							}
							break;
					}
					if(setSelectionEnd != null){
						data.ta.value=res;
						setSelectionRange(data.ta,setSelectionEnd,setSelectionEnd);
					}
				}
				
				if(text.charAt(0)=="'" || text.charAt(1)=="'"){// if user type inside single quotes
					// check for suggestion of which field
					 selectionEnd = getTextAreaSelectionEnd(data.ta);
					 res=data.ta.value;
					var subString=res.substring(0, selectionEnd);
					var count = (subString.match(/'/g) || []).length;
					if(count%2==1)
						subString=subString+"'";
					res=SQLParser.lexer.tokenize(subString);
					if(res[res.length-3]!=null && res[res.length-4]!=null){
						if(res[res.length-3][0]=='OPERATOR')
							selectedField=res[res.length-4][1];
						else if(res[res.length-3][0]=='SEPARATOR'){// if more then value in IN operator
							if(subString.lastIndexOf('IN')>-1){// if more than one selected option in IN opertor
								var prev=subString.substring(0, subString.lastIndexOf('IN'));// take substring from 0 to IN position
								prev=$.trim(prev);
								prev=prev.split(" ");
								if(prev.length>=1 && prev[prev.length-1]!=null){// to show suggestion for field  
									selectedField=prev[prev.length-1];
								}
							}
						}
					}
					text=text.substring(text.indexOf("'")+1,text.length);
					showSuggestionFor='Value';
				}else if(text.charAt(0)=="<" || text.charAt(0)==">"){// if user start typing after  
//					showSuggestionFor='Fields';
//					text=text.substring(1,text.length);
				}
				data.on.query(text,function(list){
					
					if( list.length && e.keyCode != 37 && e.keyCode != 39){
						showList(data,list,text);
						setSelected(+1,data);
						if(list.length==1 && list[0] === text.toUpperCase() && e.keyCode != 8){
							var li = getCurrentSelected(data);
							onUserSelected(li,data);
						}
					}
					else{
						hideList(data);
					}
				});
			}else{
				hideList(data);
			}
		});
		
		
		
		$(data.ta).scroll(function(e){
				var ta = e.target;			
				var miror = $(data.clone);
				miror.get(0).scrollTop = ta.scrollTop;
			});
	}	
})(jQuery);


function validateSQL(data){
//	debugger;
	displayLineNumber();
	setTimeout(function(){
		var result='';
		var appendSelect="select * from test where ";
		try{
			if(prevQuery!=data && !listVisible && $('#'+textAreaId)[0]){
				prevQuery=$.trim(data);
				if(prevQuery.length>0){
					//result=SQLParser.parse(appendSelect+data).toString();
					//If expression is syntactically correct then check for validation
					breakAndValidate(data);
					result=SQLParser.parse(appendSelect+data).toString();
					result='Rule expression is valid';
					showSuggestionFor='Conditional';
				}
				$('#ruleExprnMsg').html(result);
				$('#ruleExprnMsg').css({"color":"black"});
				$('#'+textAreaId)[0].state='Valid';
			}else if(listVisible){
				$('#ruleExprnMsg').html(result);
				$('#ruleExprnMsg').css({"color":"black"});
				$('#'+textAreaId)[0].state='Valid';
			}
//			else if($('#'+textAreaId)[0].state=='Valid'){
//				result='Rule expression is valid';
//				$('#ruleExprnMsg').html(result);
//				$('#ruleExprnMsg').css({"color":"black"});
				//$('#'+textAreaId)[0].state='Valid';
//			}
		}catch(e){
			result=e.message;
			 $('#ruleExprnMsg').css({"color":"red"});
			 if(e.lineColNumber)
				 //result=e.lineColNumber.line+":"+e.lineColNumber.col+" "+result;
			 	 result='Line: '+e.lineColNumber.line+" Column:  "+e.lineColNumber.col+" "+result;
			 else if(e.totalBytesConsumed){
				 var lineColNumber=getLineColNumber(data,e.totalBytesConsumed-appendSelect.length);
				 //result=lineColNumber.line+":"+lineColNumber.col+" "+result;
				 result='Line: '+lineColNumber.line+" Column:  "+lineColNumber.col+" "+result;
			 }
			 $('#ruleExprnMsg').html(result);
			 $('#'+textAreaId)[0].state='Error';
		}
	},200);
}


function breakAndValidate(data){
	var fieldPresent = false;
	var operatorPresent = false;
	var state='NOT_STARTED';
	var tokenExp=[];
	var openParenthesisCount=0;
	var tokens=SQLParser.lexer.tokenize(data);
	for (var i = 0; i < tokens.length; i++) {
		var token = $.trim(tokens[i][1].toString().toUpperCase());		
		if(tokens[i][0]=='DBLSTRING'){// code added by Santosh Yadav
			throwError("Double quotes not allowed",tokens[i]);
		}
		if(token.toLowerCase() == 'and' || token.toLowerCase() == 'or'){
			matchType = "logical";
			operatorPresent = true;
			//if(state == "FINISHED" || state == "WITHIN_PARENTHESES"){
				for ( var int = 0; int < openParenthesisCount; int++) {
						tokenExp.push(['RIGHT_PAREN', ')',0]);
				}
    			currLevel = openParenthesisCount;  
    			if(tokens[i-2][1]!='BETWEEN'){
    				validateExpression(tokenExp);
        			tokenExp=[];
        			for ( var int = 0; int < openParenthesisCount; int++) {
    						tokenExp.push(['LEFT_PAREN', '(',0]);
    				}
        			fieldPresent = false;
    		    	operatorPresent = false;
    			}else{
    				tokenExp.push(tokens[i]);
    				tokenExp.push(tokens[i-3]);
    				tokenExp.push(['OPERATOR','<',1]);
    			}
		    	state = 'IN_PROGRESS';			
		}else
		if(fieldDetails[token]=='Operator' || fieldDetails[token]=='Arithmetic_Operator'){
			matchType = "mathematical";	
			tokenExp.push(tokens[i]);
			operatorPresent = true;
		}
		else if(token=='(' || token=='{' || token=='['){
			matchType = "openParenthesis";    		
			if(state != 'IN_A_FUNCTION' && state != 'WITHIN_PARENTHESES_IN_A_FUNCTION'){
				state = 'WITHIN_PARENTHESES';
				openParenthesisCount++;
			}  
			tokenExp.push([tokens[i][0], '(',tokens[i][2]]);
		}
		else if(token==']' || token=='}' || token==')'){
			matchType = "closeParenthesis";	
			
			if(state != 'IN_A_FUNCTION' && state != 'WITHIN_PARENTHESES_IN_A_FUNCTION'){
				if(openParenthesisCount >= 1)
    				openParenthesisCount--;
    			state = 'IN_PROGRESS';
			}
			if(state == 'IN_A_FUNCTION')
				state = 'IN_PROGRESS';
			else if(state == 'WITHIN_PARENTHESES_IN_A_FUNCTION')
				state = 'WITHIN_PARENTHESES';	
			tokenExp.push([tokens[i][0], ')',tokens[i][2]]);
		}
		else if(token.toLowerCase()=="between"){
			if(tokens[i-1]!=null && tokens[i+1]!=null && tokens[i+2]!=null && tokens[i+3]!=null){
				var fieldType=fieldDetails[tokens[i-1][1]];
				if(fieldType!=tokens[i+1][0]){
					throwError("Invalid Data",tokens[i+1]);
				}else if(fieldType!=tokens[i+3][0]){
					throwError("Invalid Data",tokens[i+3]);
				}else if(tokens[i+2][1]!='AND'){
					throwError("Missing keyword AND",tokens[i+2]);
				}else{
					//matchType = "between";	
					tokenExp.push(tokens[i]);
					//tokenExp.push(['OPERATOR','>',21]);
					state = 'BETWEEN';
				}
			}else{
				throwError("Missing Expression",tokens[i]);
			}
			
		}
		else if(fieldDetails[token]=='Functions' || fieldDetails[token]=='SUB_SELECT_OP'){
			matchType = "functions";
			tokenExp.push(tokens[i]);
			if(token.toLowerCase()=='in'){			
				operatorPresent = true;	
			}
			//exp=exp+" "+ token;
			if(state == 'WITHIN_PARENTHESES')
				state = 'WITHIN_PARENTHESES_IN_A_FUNCTION';
			else
				state = 'IN_A_FUNCTION';
		}
		else{		
			tokenExp.push(tokens[i]);
			fieldPresent = true;
			if(tokens[i][0]=='LITERAL'){
				if(!fieldDetails[tokens[i][1].toUpperCase()])
					throwError("'"+tokens[i][1]+"' is not valid field",tokens[i]);
			}else if(tokens[i][0]=='DBLSTRING'){// code added by Santosh Yadav
				throwError("Double quotes not allowed",tokens[i]);
			}
			if(state != 'WITHIN_PARENTHESES' && state != 'IN_A_FUNCTION' && state != 'BETWEEN' && state != 'WITHIN_PARENTHESES_IN_A_FUNCTION')
				state = 'IN_PROGRESS';
		}
		
		if(!(token=='(' || token=='{' || token=='[') && !(token==')' || token=='}' || token==']'))
			prevToken = token;
		matchType = "";
		
		if(fieldPresent && operatorPresent && state != 'WITHIN_PARENTHESES' && state != 'IN_A_FUNCTION' && state != 'BETWEEN' && state !='WITHIN_PARENTHESES_IN_A_FUNCTION'){
			state = 'FINISHED';
		}
	}
	if(state != 'FINISHED' || tokenExp.length > 0){	
		if(tokenExp.length>1){
			validateExpression(tokenExp);
		}else if(tokens[tokens.length-2]!=null && (tokens[tokens.length-2][1]=='AND' || tokens[tokens.length-2][1]=='OR')){
			showSuggestionFor='Fields';
			throwError("Unexpected End Of Expression",tokens[tokens.length-2]);
		}
    }
}

function validateExpression(tokens){
		var expression='';
		var defaultDatatype=['number','string','date','boolean'];
		var replaceValues={"number":10,"string":"'STRING'","date":"'10/10/2010'","boolean":true};
		var dataType='';
		var functionType='';
		var fieldName='';
		var inArray=null;
		var isLiteralPresent=false;
		var isOperatorPresent=false;
		var obj=null;
		for ( var i = 0; i < tokens.length; i++) {
			obj=tokens[i];
			if(obj[0]=="EOF")
				break;
			if(obj[0]=='LITERAL'){
				isLiteralPresent=true;
				fieldName=obj[1].toUpperCase();
				if(fieldDetails[fieldName]){
					if(dataType=="")
						dataType=fieldDetails[fieldName];
					else if(fieldDetails[fieldName]!=dataType.toUpperCase())
						throwError("Can't compare "+dataType.toLowerCase()+" with "+fieldDetails[fieldName].toLowerCase(),obj);
					
					if(replaceValues[fieldDetails[fieldName].toLowerCase()])
						expression= expression+" "+replaceValues[fieldDetails[fieldName].toLowerCase()]+" ";
				}
				else{
					throwError("'"+obj[1]+"' is not a valid field",obj);
				}
			}else if(obj[0]=='CONDITIONAL'){
				if(obj[1].toLowerCase()=='and'){
					expression= expression+" && ";
				}else if(obj[1].toLowerCase()=='or'){
					expression= expression+" || ";
				}
			}else if(obj[0]=='OPERATOR'){
				if(fieldDetails[obj[1].toUpperCase()]){
					isOperatorPresent=true;
					if((obj[1]=='IS NOT' || obj[1]=='IS') && tokens[i+1][1]!='NULL'){
						throw new Error("Missing NULL keyword");
					}
					if(obj[1]=='=' || obj[1]=='LIKE' || obj[1]=='IS'){
						expression= expression+" == ";operator='==';
					}else if(obj[1]=='IS NOT' || obj[1]=='<>'){
						expression= expression+" != ";operator='!=';
					}else if(obj[1]=='BETWEEN'){
						expression= expression+" > ";operator='>';
					}else{
						expression= expression+" "+obj[1]+" ";operator=obj[1];
					}
					// code to check expr conpleated or not
					
				}
				else{
					throwError("'"+obj[1]+"' is not supported",obj);
				}
				
			}else if(obj[0]=='SEPARATOR'){
				if(functionType=='ABS'){
					throw new Error("Invalid number of argument in ABS function");
				}
			}else if(obj[0]=='SUB_SELECT_OP' && (obj[1].toLowerCase()=="in" || obj[1].toLowerCase()=="not in")){
				functionType=obj[1];
				if(tokens[i-1]==null || tokens[i-1]==undefined || tokens[i-1][0]!='LITERAL'){// if before operator no any field is present or any invalid field is present
						throwError("Required field before operator "+obj[1],obj);// show error message 
				}else if(tokens[i+1]!=null && tokens[i+2]!=null && tokens[i+3]!=null){
					if(tokens[i+2][0]=='RIGHT_PAREN'){// if after operator no field of value then show error msg
						 if(dataType=='STRING')
								throwError("Expected: string or a field",tokens[i+2]);
							else if(dataType=='NUMBER')
								throwError("Expected: number or a field",tokens[i+2]);
					}
				}
			}else if(functionType!=""){
				if(functionType=='ABS'){
					expression= expression+obj[1];
				}else if(functionType=='IN' || functionType=='NOT IN'){
					if(inArray==null)
						inArray=[];	
					if(obj[0]==dataType){
						if(replaceValues[obj[0].toLowerCase()]){
							var suggestionList=defaultValues[fieldName];// check for suggestion list
							if(suggestionList!=null && suggestionList.length>0){
								if(!contains(suggestionList,obj[1]))// if value not selected form suggestion then show error
									throwError("'"+obj[1]+"' is an invalid value for "+fieldName+" field",obj);
								else
									inArray.push(obj[1]);
							}else
								inArray.push(obj[1]);
						}else
							inArray.push(obj[1]);
						
					}
				}
				
			}else if(obj[0]=='FUNCTION'){
				if(fieldDetails[obj[1].toUpperCase()]){
					if(obj[1]=='ABS'){
						functionType=obj[1];
						if(dataType!='' && dataType!='NUMBER'){
							throw new Error("Can't compare "+dataType.toLowerCase()+" with numerical return value");
						}else{
							expression= expression+" Math.abs ";
						}
					}
				}
				else{
					throwError("'"+obj[1]+"' is not supported",obj);
				}
				
			}else{
				if(replaceValues[obj[0].toLowerCase()]){
					var suggestionList=defaultValues[fieldName];
					if(suggestionList!=null && suggestionList.length>0){
						if(!contains(suggestionList,obj[1]))
							throwError("'"+obj[1]+"' is an invalid value for "+fieldName+" field",obj);
						else
							expression= expression+" "+replaceValues[obj[0].toLowerCase()]+" ";
					}else
						expression= expression+" "+replaceValues[obj[0].toLowerCase()]+" ";
				}else
					expression= expression+" "+obj[1]+" ";
			}
			if(dataType=="" && contains(defaultDatatype,obj[0].toLowerCase()))
				dataType=obj[0].toLowerCase();
			
			if(dataType.toLowerCase() != 'number' && (obj[0]=='MATH_MULTI' || obj[0]=='MATH') && functionType!='ABS')
				throwError("Can't perform arithmetic operation on "+dataType.toLowerCase(),obj);
			
			if(contains(defaultDatatype,obj[0].toLowerCase()) && dataType.toLowerCase()!=obj[0].toLowerCase()){
				if(dataType=='DATE' && obj[0]=='STRING'){// code change by santosh Yadav
					var pattern = new RegExp("([0-9]{2}[-]){1}([0-9]{2}[-]){1}([0-9]{4}){1}");
					if(pattern.test(obj[1])){						
						var numbers = obj[1].match(/\d+/g); 					
						if(numbers && numbers.length==3){
							var date = new Date(numbers[2],numbers[1],numbers[0]);
							if(date.toDateString()=='Invalid Date'){
								date = new Date(numbers[2],numbers[0],numbers[1]);
								if(date.toDateString()=='Invalid Date')
									throwError("Enter date in DD-MM-YYYY or MM-DD-YYYY format to compare",obj);
							}
						}						
					}
					else
						throwError("Enter date in DD-MM-YYYY or MM-DD-YYYY format to compare",obj);				
				}else if(obj[1]=='NULL'){
					
				}else if(functionType=='ABS' && obj[0]=='STRING'){
					throw new Error("ABS function require only numerical value");
				}else
					throwError("Can't compare "+dataType.toLowerCase()+" with "+obj[0].toLowerCase(),obj);
			}				
		}
		if(functionType!="" && fieldName!="" && inArray!=null){
			if(functionType.toLowerCase()=="in"){
				expression= "contains(inArray,"+replaceValues[fieldDetails[fieldName].toLowerCase()]+")";
				expression=expression+" == true";
			}				
			else if(functionType.toLowerCase()=="not in"){
				expression= "contains(inArray,"+replaceValues[fieldDetails[fieldName].toLowerCase()]+")";
				expression=expression+" == false";
			}				
		}
		
		
		
		
		if(isLiteralPresent && isOperatorPresent){
			var data=expression.split(operator);
			if(data[1]==null || data[1]=="" || data[1]==" "){
				if(dataType=='STRING')
					throwError("Expected: string or a field",obj);
				else if(dataType=='NUMBER')
					throwError("Expected: number or a field",obj);
			}
		}else if(!isOperatorPresent){
			if(!isLiteralPresent){
				throwError("Incomplete expression",obj);
			}else if(dataType=='STRING' && functionType!='IN' && functionType!='NOT IN')
					throwError("Expected: >, =, >, <, <>, >=, <=, IN, etc..",obj);
			 else if(dataType=='NUMBER' && functionType!='IN' && functionType!='NOT IN')
					throwError("Expected: >, =, >, <, <>, >=, <=, +, -, /, *, IN, etc..",obj);
			
		}
		
		var evalResult=eval(expression);
		
		if(evalResult==undefined){	
			throwError("Datatype mismatch",obj);
		}else if(evalResult.toString()=='NaN'){
			//throwError("Arithmetic operation performed on numbers only",tokens[0]);
			throwError("Expected: number or a field",obj);
		}else if(typeof evalResult != "boolean"){
			throwError("Result is "+(typeof evalResult)+" expected boolean",obj);
		}else if(typeof evalResult == "boolean" && !isLiteralPresent && !isOperatorPresent){
			throwError("'"+tokens[0][1]+"' is invalid expression",obj);
		}
}


function countOcurrences(str, value){
	   var regExp = new RegExp(value, "gi");
	   return str.match(regExp) ? str.match(regExp).length : 0;  
}

function findInArray(array,value){
	var found=false;
	for (var int = 0; int < array.length; int++) {
		if(array[int]==value){
			found=true;
			break;
		}
	}
	return found;
}
function initAutoCompleteTextArea(id){
	textAreaId=id;
	showSuggestionFor='Fields';
	selectedField=null;
	prevQuery='';
	//$('#'+id)[0].state='Error';
	$("#"+id).autocomplete({
				wordCount:1,
				on: {
					query: function(text,cb){
						//console.log(showSuggestionFor+'==query=='+selectedField);
						var words = [];
						if(showSuggestionFor=='Value'){
							var suggestionList=defaultValues[selectedField];
							if(suggestionList!=null){
								for( var i=0; i<suggestionList.length; i++ ){
									if( suggestionList[i].toLowerCase().indexOf(text.toLowerCase()) == 0 ) words.push(suggestionList[i]);
									if( words.length > 5 ) break;
								}
							}
						}else if(showSuggestionFor=='Operator'){
							for( var i=0; i<sqlOperatorFun.length; i++ ){
								if( sqlOperatorFun[i].fieldCaption.toLowerCase().indexOf(text.toLowerCase()) == 0 ) words.push(sqlOperatorFun[i].fieldCaption);
								if( words.length > 5 ) break;
							}
						} else if(showSuggestionFor=='Conditional'){
							for( var i=0; i<conditional.length; i++ ){
								if( conditional[i].fieldCaption.toLowerCase().indexOf(text.toLowerCase()) == 0 ) words.push(conditional[i].fieldCaption);
								if( words.length > 5 ) break;
							}
						}else{
							for( var i=0; i<autoCompleteList.length; i++ ){
								if( autoCompleteList[i].toLowerCase().indexOf(text.toLowerCase()) == 0 ){
									if(selectedField=='ABS' || fieldDetails[selectedField]=='NUMBER'){
										if(fieldDetails[autoCompleteList[i]]=='NUMBER' ||  autoCompleteList[i]=='ABS'){
											words.push(autoCompleteList[i]);
										}
									}else
										words.push(autoCompleteList[i]);
								}
								if( words.length > 5 )
									break;
							}
						}
						
						cb(words);								
					}
				}
			});
	validateSQL($("#"+id).text());
}
function initAutoCompleteList(list,details,values,sqlOperator,conditional){
	autoCompleteList=list;
	fieldDetails=details;
	defaultValues=values;
	sqlOperatorFun=sqlOperator;
	conditionalList=conditional;
}
/*$(document).ready(function(){
	initAutoCompleteTextArea(textAreaId);
});*/

function displayLineNumber(){
	if($("#"+textAreaId).is(":focus")){
		var textarea=document.getElementById(textAreaId);
		var value=textarea.value;
		var cursorPosition=0;
		if(textarea.selectionDirection){
			if(textarea.selectionDirection.toLowerCase()=='forward')
				cursorPosition=textarea.selectionEnd;
			else if(textarea.selectionDirection.toLowerCase()=='backward')
				cursorPosition=textarea.selectionStart;
		}
		else {
			cursorPosition = getTextAreaSelectionEnd(textarea);
		}
		var lineColNumber=getLineColNumber(value,cursorPosition);
		$('#lineColumnInfo').text('Line: '+lineColNumber.line+ ' Column: ' +lineColNumber.col);
	}
	else
		$('#lineColumnInfo').text("");
}

function getLineColNumber(text,cursorPosition){	
	var subtext=text.substr(0, cursorPosition);
	var lineArr = subtext.split("\n");
	var lineColNumber=new Object();
	lineColNumber.line = lineArr.length;
	lineColNumber.col = lineArr[lineArr.length-1].length+1;
	return lineColNumber;
}

function throwError(message,token){
	var lineColNumber=null;
	var errorPart=null;
	if(token){
		lineColNumber=getLineColNumber(prevQuery,token[2]);
		errorPart=token[1];
	}	
	throw{
			message : message,
			lineColNumber : lineColNumber,
			errorPart : errorPart
	};
}

function contains(arr, findValue) {
	var i = arr.length;       
    while (i--) {
    	if (arr[i] === findValue) 
    		return true;
    }
    return false;
}


//For IE8
function getTextAreaSelectionEnd(ta) {
	 var textArea = ta;//document.getElementById('textarea1');
	 if (document.selection) { //IE
		var bm = document.selection.createRange().getBookmark();
		var sel = textArea.createTextRange();
		sel.moveToBookmark(bm);
		var sleft = textArea.createTextRange();
		sleft.collapse(true);
		sleft.setEndPoint("EndToStart", sel);		  
		return sleft.text.length + sel.text.length;		  
	}
	return textArea.selectionEnd;	//ff & chrome 
}


function setSelectionRange(input, selectionStart, selectionEnd) {
	  if (input.setSelectionRange) {
	    input.focus();
	    input.selectionStart=selectionStart;
	    input.selectionEnd=selectionEnd;
	  }
	  else if (input.createTextRange) {
	    var range = input.createTextRange();
	    range.collapse(true);
	    range.moveEnd('character', selectionEnd);
	    range.moveStart('character', selectionStart);
	    range.select();
	  }
}