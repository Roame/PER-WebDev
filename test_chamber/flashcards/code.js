container = document.getElementById("container")
flash = document.getElementById("flash");

let T = true;
function update(event){
	if(T){
		flash.innerHTML = "Boo!"
	} else {
		flash.innerHTML = "\\(x^2 = \\frac{1}{e^{x}}\\)";
		MathJax.typeset()
	}
	T = !T

	console.log("Hello?!");
}
flash.onclick = update;