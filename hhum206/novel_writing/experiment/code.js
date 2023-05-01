import { txt_data } from "./data.js";

const canvas = document.getElementById("storyCanvas");
const ctx = canvas.getContext("2d");


function getTextWidth(txt, fontName, fontSize){
	let fontspec = fontSize + ' ' + fontName;
	ctx.font = fontspec
	return ctx.measureText(txt).width;
}

class Rect {
	constructor(x,y,w,h,color=null){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.color = color;
	}

	draw(){
		ctx.beginPath()
		ctx.rect(this.x,this.y,this.w,this.h)
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	isAt(x,y){
		return this.x <= x  && x <= this.x+this.w && this.y <= y && y <= this.y+this.h;
	}
}

class Button {
	constructor(rect, text, c1, c2){
		this.rect = rect;
		this.rect.color = c1;
		this.text = text;
		this.c1 = c1;
		this.c2 = c2;
		this.state = false;
	}

	draw(){
		this.rect.color = this.state ? this.c2 : this.c1;
		this.rect.draw();
		ctx.fillStyle = "#000000";
		ctx.font = (this.rect.h-10)+"px serif";
		ctx.textAlign="center"
		ctx.textBaseline = "middle"
		ctx.fillText(this.text, this.rect.x+this.rect.w/2, this.rect.y+this.rect.h/2);
	}

	isAt(x,y){
		return this.rect.isAt(x,y)
	}

	onClick(){
		// Currently not using this oddly enough
	}
}

class TextBox {
	constructor(x,y,w,paragraphs){
		this.x = x;
		this.y = y;
		this.w = w;
		this.pgs = paragraphs;
		this.fontName = "serif";
		this.fontSizeInt = 14;
		this.fontSize = this.fontSizeInt.toString()+"px"
		this.preppedPgs = TextBox.prepareStringP(paragraphs,w,this.fontName,this.fontSize);
		this.num_lines = 0;
		for(let pg of this.preppedPgs){
			this.num_lines += pg.length+1;
		}
		this.num_lines--;
		this.h = this.num_lines*this.fontSizeInt;
	}

	static prepareString(text, width, fontName, fontSize){
		let words = text.split(" ");
		let lengths = [];
		let output = [];
		let j = 0;
		let runningWidth = 0;
		let space_width = getTextWidth(" ",fontName,fontSize)

		for(let i = 0; i < words.length; i++){
			let word = words[i]
			let len = getTextWidth(word,fontName,fontSize)
			if(i==0){
				output.push(word);
				runningWidth = len
			} else if(runningWidth+space_width+len <= width){
				output[j] += " " + word;
				runningWidth += space_width + len
			} else {
				output.push(word);
				runningWidth = len
				j++;
			}
		}
		return output;
	}

	static prepareStringP(paragraphs, width, fontName, fontSize){
		let mod_ps = [];
		for(let paragraph of paragraphs){
			mod_ps.push(TextBox.prepareString(paragraph, width, fontName, fontSize));
		}
		return mod_ps;
	}

	draw(){
		ctx.fillStyle = "#000000";
		ctx.font=this.fontSize+" "+this.fontName;
		ctx.textAlign="left";
		ctx.textBaseline="top";
		let lineCount = 0;
		for(let i = 1; i < this.preppedPgs.length; i++){
			let pg = this.preppedPgs[i];
			for(let j = 0; j < pg.length; j++){
				let txt = pg[j];
				ctx.fillText(txt,this.x,this.y+this.fontSizeInt*lineCount);
				lineCount++;
			}
			lineCount ++;
		}
	}
}

class FramedTextBox {
	constructor(textBox, margin, color){
		this.textBox=textBox;
		this.margin=margin;
		this.color=color;
	}

	draw(){
		let x = this.textBox.x;
		let y = this.textBox.y;
		let w = this.textBox.w;
		let h = this.textBox.h;
		new Rect(x-this.margin,y-this.margin,w+2*this.margin,h+2*this.margin, this.color).draw();
		this.textBox.draw();
	}
}

class Timestamp {
	constructor(txt){
		this.month = parseInt(txt[0]+txt[1]);
		this.day = parseInt(txt[3]+txt[4]);
		this.hour = parseInt(txt[6]+txt[7]);
		this.minute = parseInt(txt[8]+txt[9]);
	}

	before(ts){
		// I'm going to do something pretty crude here :)
		let ts1_s = this.month*31*24*60 + this.day*24*60 +this.hour*60+this.minute; 
		let ts2_s = ts.month*31*24*60 + ts.day*24*60 +ts.hour*60+ts.minute; 
		return ts1_s < ts2_s
	}

	after(ts){
		let ts1_s = this.month*31*24*60 + this.day*24*60 +this.hour*60+this.minute; 
		let ts2_s = ts.month*31*24*60 + ts.day*24*60 +ts.hour*60+ts.minute; 
		return ts1_s > ts2_s
	}

	equals(ts){
		return !this.before(ts) && !this.after(ts);
	}

	toString(){
		return ("0" + this.month).slice(-2) +"/"+
			("0" + this.day).slice(-2)+"-"+
			("0" + this.hour).slice(-2)+
			("0" + this.minute).slice(-2);
	}
}

class StoryChunk {
	constructor(lines){
		let header_split = lines[0].split(" ");
		this.char = header_split[1];
		this.char_inst = parseInt(header_split[2]);
		this.ts1 = new Timestamp(header_split[3]);
		this.ts2 = new Timestamp(header_split[4]);
		this.lines = lines;
	}
}

function parseData(data){
	let lines = data.split("\n");
	lines = lines.filter(v=>v!="");

	let storyChunks = [];
	let bunch = [];
	for(let i=0; i<lines.length; i++){
		let line = lines[i];
		if((line[0] == "#" && i != 0) || i==lines.length-1){
			if(i==lines.length-1) bunch.push(line);
			storyChunks.push(new StoryChunk(bunch));
			bunch = [];
		}
		bunch.push(line);
	}

	return storyChunks;
}

function filterByName(chunks, character){
	let out = [];
	for(let chunk of chunks){
		if(chunk.char == character){
			out.push(chunk);
		}
	}
	return out;
}

function orderInst(chunks){
	let out = [chunks[0]];
	for(let i=1; i < chunks.length; i++){
		let chunk = chunks[i];
		let posFound = false;
		for(let j=0; j < out.length; j++){
			if(out[j].char_inst > chunk.char_inst){
				out.splice(j,0,chunk);
				posFound=true;
				break;
			}
		}
		if(!posFound) out.push(chunk);
	}
	return out;
}

function orderChrono(chunks){
	let organizedChunks = [chunks[0]];
	for(let i = 1; i< chunks.length; i++){
		let chunk = chunks[i];
		let pos_found = false;
		for(let j = 0; j < organizedChunks.length; j++){
			if(organizedChunks[j].ts1.after(chunk.ts1)){
				organizedChunks.splice(j,0,chunk);
				pos_found = true;
				break;
			}
		}
		if(!pos_found){
			organizedChunks.push(chunk);
		}
	}
	return organizedChunks;
}


let tbs = [];
let storyChunks = {};
let cInterval = null;
let maxScroll = 2000;
let scroll_pos = 0;
let y0 = 100;
let dy = 0;
let modes = ["chronological", "Tim", "Maia"];
let overlayEnabled = false;

function setMode(mode){
	tbs=[];
	scroll_pos = 0;
	if(mode == modes[0]){
		overlayEnabled = true;	
		let tb_width = (canvas.width-100)/3;
		maxScroll = 1300;

		// Earliest Tim
		let tim1_arr = [
			0, 		// 4
			400, 	// 5 - 325
			750, 	// 6 - 700
			850,	// 7
			1500,	// 8
			1710	// 9
			];
		// Tim at the start of the story
		let tim2_arr = [
			850,	// 1
			1350,	// 2
			1500	// 3
			];
		let maia_arr = [
			400,	// 1
			850,	// 2
			1710	// 3
			];

		for(let chunk of storyChunks){
			if(chunk.char == "Tim" && chunk.char_inst >3){
				tbs.push(new TextBox(25, tim1_arr[chunk.char_inst-4]+y0, tb_width, chunk.lines));
			} else if (chunk.char == "Tim" && chunk.char_inst <=3){
				tbs.push(new TextBox(50+tb_width, tim2_arr[chunk.char_inst-1]+y0, tb_width, chunk.lines));
			} else if (chunk.char == "Maia"){
				tbs.push(new TextBox(75+2*tb_width, maia_arr[chunk.char_inst-1]+y0, tb_width, chunk.lines));
			} else {
				console.log("We have a problem: ", chunk.char);
			}
		}
	} else if(mode==modes[1] || mode == modes[2]){
		overlayEnabled=false;
		let chunks = 0;
		if(mode ==modes[1]){
			chunks = filterByName(storyChunks, "Tim");
			maxScroll=500;
		} else {
			chunks = filterByName(storyChunks, "Maia");
			maxScroll=0;
		}
		chunks = orderInst(chunks);
		let tb_width = canvas.width-50;
		let runningHeight = y0;
		for(let chunk of chunks){
			let tb = new TextBox(25, runningHeight, tb_width, chunk.lines);
			tbs.push(tb);
			runningHeight += tb.h;
		}
	}
}

async function main(data){
	storyChunks = parseData(data);
	setMode(modes[0]);
	
	// Setting up the interface
	let banner = new Rect(0,0,canvas.width, 80, "#F1F1F1");
	let ButtonTB = new TextBox(10,15,80, ["","Select mode:"]);
	let btn1 = new Button(new Rect(90,10,100,22), "Chronological", "#FFFFFF", "#00F900");
	let btn2 = new Button(new Rect(190,10,100,22), "Tim's Perpective", "#FFFFFF", "#00F900");
	let btn3 = new Button(new Rect(290,10,100,22), "Maia's Perspective", "#FFFFFF", "#00F900");
	btn1.state = true;

	let r1 = new Rect(0,80,8,canvas.height-80,"#F1F1F1");
	let r2 = new Rect(250,80,8,canvas.height-80,"#F1F1F1");
	let r3 = new Rect(490,80,8,canvas.height-80,"#F1F1F1");
	let r4 = new Rect(canvas.width-8,80,8,canvas.height-80,"#F1F1F1");
	let timTB = new TextBox(230,45,200, ["","Tim"]);
	let maiaTB = new TextBox(585,45,200, ["","Maia"]);

	(canvas.width-100)/3+75/2;

	timTB.fontSize = "30px";
	maiaTB.fontSize = "30px";

	function drawInterface(){
		banner.draw();
		ButtonTB.draw();
		btn1.draw();
		btn2.draw();
		btn3.draw();
		if(overlayEnabled){
			r1.draw();
			r2.draw();
			r3.draw();
			r4.draw();
			timTB.draw();
			maiaTB.draw();
		}		
	}

	let mousePos = [0,0];

	function mouseMoveHandler(e){
		let rect = canvas.getBoundingClientRect();
		let x = e.clientX-rect.left;
		let y = e.clientY-rect.top;

		mousePos = [x,y];
	}
	onmousemove = mouseMoveHandler;

	function mouseClickHandler(){
		if(btn1.isAt(mousePos[0], mousePos[1])){
			btn1.state = true;
			btn2.state = false;
			btn3.state = false;
			setMode(modes[0]);
		} else if(btn2.isAt(mousePos[0], mousePos[1])){
			btn1.state = false;
			btn2.state = true;
			btn3.state = false;
			setMode(modes[1]);
		} else if(btn3.isAt(mousePos[0], mousePos[1])){
			btn1.state = false;
			btn2.state = false;
			btn3.state = true;
			setMode(modes[2]);
		}
	}
	onclick = mouseClickHandler;

	// clearInterval(cInterval);
	cInterval = setInterval(function (){
		let r = new Rect(24, 0, canvas.width-48, canvas.height, "#FFFFFF");
		r.draw();
		
		let pPos = scroll_pos;
		if(scroll_pos+dy > maxScroll){
			scroll_pos = maxScroll;
		} else if(scroll_pos+dy < 0){
			scroll_pos = 0
		} else {
			scroll_pos += dy;
		}

		for(let tb of tbs){
			tb.y -= scroll_pos-pPos;
			tb.draw();
		}
		drawInterface();
	}, 50);	
}

main(txt_data)
// jQuery.get('https://scaredcrow.dev/hhum206/novel_writing/experiment/test.txt', main);

function scream(e){
	dy = Math.abs(e.deltaY) > 5 ? 2*e.deltaY : 0;
}
document.addEventListener("wheel", scream);


// txt = "This is a test sentence that "+
// "Hopefully goes beyond whatever text " +
// "limit I choose to impose upon it. :)";
// let textBox = new TextBox(0,100,300,txt);
// let fTextBox = new FramedTextBox(textBox, 0, "#F1F1F1");
// fTextBox.draw()



// let mousePos = [0,0];

// function mouseMoveHandler(e){
// 	let rect = canvas.getBoundingClientRect();
// 	let x = e.clientX-rect.left;
// 	let y = e.clientY-rect.top;

// 	mousePos = [x,y]

// 	if(btn.isAt(x,y)){
// 		btn.rect.color = "#FFFFFF";
// 	} else {
// 		btn.rect.color = "#000000";
// 	}
// 	btn.draw();
// }
// onmousemove = mouseMoveHandler;

// function mouseClickHandler(){
// 	console.log("There's been a click!");
// 	if(btn.isAt(mousePos[0], mousePos[1])){
// 		btn.onClick();
// 	}
// }
// onclick = mouseClickHandler;



