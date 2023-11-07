
		//C88 instance
		var c = new c88();

		//Memory array
		var bits = [
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0
		];

		//General purpose input
		var inbits = [0,0,0,0,0,0,0,0];

		//Data bits
		var dataBits = [0,0,0,0,0,0,0,0];
		
		//Address bits
		var addressBits = [0,0,0];

		//Integer copy of memory
		var myMem = [0,0,0,0,0,0,0,0];
	
		//Integer versions of main reg, PC and output register.
		var myReg = 0;
		var myPC = 0;
		var myOut = 0;

		//returns true if str ends with suffix
		function endsWith(str, suffix) {
		    return str.indexOf(suffix, str.length - suffix.length) !== -1;
		}

		//Convert an array of eight bits to an integer
		function bitsToNum(bits){
			result = 0;
			for (var b=0; b<=7; b++){
				bitVal = (1<<(7-b));
				result += bits[b] * bitVal;
			}
			return result;
		}

		//Convert an integer to an array of eight bits
		function numToBits(num){
			result = [0,0,0,0,0,0,0,0];
			for (var b=0; b<=7; b++){
				bitVal = (1<<(7-b));
				result[b] = (((num&bitVal)>0)?1:0);
			}
			return result;
		}

		//GUI function. Set bits that the user can see on the screen.
		function updateBits(prefix, bits, numbits, val){
			//For each bit according to numbits total
			for (var i=0; i<=numbits-1; i++){
				//find the image tag which has an id that starts with the prefix and ends with the currend index
				image = document.getElementById(prefix+i);
				//Set it to be on or off depending on bits parameter
				if (bits[i]==1){image.src="images/bit_1.png";}
				else{image.src="images/bit_0.png";}
			}
            if (['r', 'p', 'o'].includes(prefix) && val !== undefined){ //edited here to try so solve the undefined error (added the && val !== undefined)
                document.getElementById(prefix + 'Val').innerText = val;
            }
		}

		//Set the inputs to the C88 object (the memory and the GP input)
		function refreshMem(){
			for (i=0; i<=7; i++){
				myMem[i] = bitsToNum(bits.slice(i*8, i*8+8));
			}
			c.mem = myMem;

			c.in = bitsToNum(inbits);
			disassemble();
		}

		//Disassemble the program and show the disassembly to the right of the memory
		function disassemble(){
			for (var i=0; i<=7; i++){
				textRow = document.getElementById("d"+i);
				
				var op = myMem[i] >> 3;
				textRow.textContent = c.debug[op](myMem[i] & 7);
			}
		}

		//Update the memory and other outputs on the GUI.
		function updateMem(){

			//Get all of the values we need
			myMem = c.mem;
			myReg = c.reg;
			myPC = c.pc;
			myOut = c.out;

			//Convert the memory from an integer array to a bit array, eight bits at a time
				//Init
				myMemLines = [[],[],[],[],[],[],[],[]];
				//For each line
				for (var i=0; i<=7; i++){
					//Convert line to bits
					myMemLines[i] = numToBits(myMem[i]);
				}
				//Concatenate the arrays into one long 64 bit array
				bits = [].concat.apply([], myMemLines);

			//Convert the other outputs to bit arrays
			myRegBits = numToBits(myReg);
			myPCBits = numToBits(myPC).slice(5,8);
			myOutBits = numToBits(myOut);

			//Update the GUI with the new bit arrays
			updateBits("", bits, 64, null);
			updateBits("r", myRegBits, 8, myReg);
			updateBits("p", myPCBits, 3, myPC);
			updateBits("o", myOutBits, 8, myOut);

			//Show the program.
			disassemble();
		}

		//Toggle a memory bit (this is the image on click function) Not needed anymore, but I didn't want to remove all the OnClick from the html
		function toggleBit(image){}
        function toggleBit_disabled(image){
			if (endsWith(image.src,"images/bit_0.png")){
				image.src="images/bit_1.png";
				bits[image.id]=1;
			}
			else{
				image.src="images/bit_0.png";
				bits[image.id]=0;
			}
			refreshMem();
		}

		//Toggle a GP input bit (this is the image on click function)
		function toggleInput(image){
			if (endsWith(image.src,"images/switch_0.png")){
				image.src="images/switch_1.png";
				inbits[image.id[1]]=1;
			}
			else{
				image.src="images/switch_0.png";
				inbits[image.id[1]]=0;
			}
			var el = document.getElementById("gpiVal")
            el.innerHTML=bitsToNum(inbits);
            refreshMem();
		}

		//Toggle a memory data bit (this is the image on click function)
		function toggleData(image){
			if (endsWith(image.src,"images/switch_0.png")){
				image.src="images/switch_1.png";
				dataBits[image.id[4]]=1;
			}
			else{
				image.src="images/switch_0.png";
				dataBits[image.id[4]]=0;
			}
			var el = document.getElementById("dataVal")
            el.innerHTML=bitsToNum(dataBits);
		}

		//Toggle an Address bit (this is the image on click function)
		function toggleAddress(image){
			if (endsWith(image.src,"images/switch_0.png")){
				image.src="images/switch_1.png";
				addressBits[image.id[7]]=1;
			}
			else{
				image.src="images/switch_0.png";
				addressBits[image.id[7]]=0;
			}
            var el = document.getElementById("addressVal")
            el.innerHTML=bitsToNum([0,0,0,0,0].concat(addressBits));
		}
	
		//This stores the current interval ID, if we have one.
		var runner = -1;

		//Run stop and reset functions follow...
		function runSlow(){
			stop();
			runner = setInterval(step, 250);  //was 125 changed to 250
		}

		function runFast(){
			stop();
			runner = setInterval(step, 1);
		}

		function step(){
			c.step();
			updateMem();
		}

		function stop(){
			if (runner > -1){
				clearInterval(runner);
			}
		}

		function reset(){
			stop();
			c.reset();
			updateMem();
		}

		//Write function for the write button (the code present is for the stop function)
		function writeData(){
			var AddressDec = bitsToNum([0,0,0,0,0].concat(addressBits));
            var image;
            for (let i = 0; i < 8; i++) {
                bits[AddressDec*8+i]=dataBits[i];
                image = document.getElementById(AddressDec*8+i);
                if (dataBits[i] == 1) {
                    image.src = "images/bit_1.png";
                } else {
                    image.src = "images/bit_0.png";
                }
            }
            refreshMem();
		}


		//Initialisation
		var QueryString = function () {
		  // This function is anonymous, is executed immediately and 
		  // the return value is assigned to QueryString!
		  var query_string = {};
		  var query = window.location.search.substring(1);
		  var vars = query.split("&");
		  for (var i=0;i<vars.length;i++) {
		    var pair = vars[i].split("=");
			// If first entry with this name
		    if (typeof query_string[pair[0]] === "undefined") {
		      query_string[pair[0]] = pair[1];
			// If second entry with this name
		    } else if (typeof query_string[pair[0]] === "string") {
		      var arr = [ query_string[pair[0]], pair[1] ];
		      query_string[pair[0]] = arr;
			// If third or later entry with this name
		    } else {
		      query_string[pair[0]].push(pair[1]);
		    }
		  } 
		    return query_string;
		} ();

		if (typeof QueryString.preload !== 'undefined') {
	    		myReg = QueryString.preload;
			c.reg = myReg;
		}

		if (typeof QueryString.mem !== 'undefined') {
			var memStrings = QueryString.mem.split(",");
			for (var i=0; i<= 7; i++){
				myMem[i] = parseInt(memStrings[i]);
			}
			c.mem = myMem;
		}

		function genUrl(){

			win = window.parent;

			var url = win.location.href.split("?")[0]
			var urlsearch = "";
			if (myReg !=0){
				urlsearch += "preload=" + myReg + "&";
			}
			urlsearch += "mem=" + myMem.join(",");
			return url+"?"+urlsearch;
		}

		function urlToBox(){
			output = document.getElementById("output");
			output.value = genUrl();
		}

		window.onload = updateMem;