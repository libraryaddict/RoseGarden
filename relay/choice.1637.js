const kol=require("kolmafia")

module.exports.main=function main(pageTextEncoded){
	let pageText=kol.urlDecode(pageTextEncoded);
	let multiplier = 35;
	let found=pageText.match(/var RG = (.*?);<\/script>/);
	if(!found){
		return;
	}
	let data=JSON.parse(found[1]);
	let grid=data.grid;
	
	let output="<svg width='"+(31*multiplier)+"' height='"+(31*multiplier)+"' viewbox='0 0 "+(31*multiplier)+" "+(31*multiplier)+"' xmlns='http://www.w3.org/2000/svg'>";
	for(let x=0;x<31;x++){
		for(let y=0;y<31;y++){
			let c=grid.charAt(31*y+x);
			let fill;
			let style="stroke-width:1;stroke:black";
			if(c=="0"||c=="4"){
				fill="lightyellow";
			}else if(c=="1"){
				fill="black";
			}else if(c=="2"||c=="3"){
				fill="lemonchiffon";
			}else if(c=="5"){
				fill="maroon";
			}else if(c=="6"){
				fill="midnightblue";
			}else if(c=="7"){
				fill="silver";
			}else if(c=="8"){
				fill="lime";
			}else{
				fill="orange";
			}
			output+="<rect width='"+multiplier+"' height='"+multiplier+"' x='"+(x*multiplier)+"' y='"+(y*multiplier)+"' fill='"+fill+"' style='"+style+"'/>";
		}
	}
	
	for(poi of data.pois){
		if(kol.getProperty("vr1637_printPois")=="true"){
			kol.print(JSON.stringify(poi));
		}
		let fill="blue";
		if(poi.k=="fountain"){
			fill="cyan";
		}else if(poi.k=="monster"){
			fill="darkred";
		}else if(poi.k=="food"||poi.k=="booze"||poi.k=="spleen"){
			fill="green";
		}else if(poi.k=="chest"){
			fill="orange";
		}
		output+="<circle cx='"+(multiplier*poi.x+(multiplier*0.5))+"' cy='"+(multiplier*poi.y+(multiplier*0.5))+"' r='"+(multiplier*0.3)+"' fill='"+(poi.d==1?"silver":fill)+"' style='stroke-width:10;stroke:"+fill+"'/>";
	}
	
	output+="<polygon points='"+(multiplier*data.pos.x+(multiplier*0.5))+","+(multiplier*data.pos.y+(multiplier*0.25))+" "+(multiplier*data.pos.x+(multiplier*0.75))+","+(multiplier*data.pos.y+(multiplier*0.75))+" "+(multiplier*data.pos.x+(multiplier*0.25))+","+(multiplier*data.pos.y+(multiplier*0.75))+"' style='fill:lime;stroke:black' transform='rotate("+(data.pos.f*90)+","+(multiplier*data.pos.x+(multiplier*0.5))+","+(multiplier*data.pos.y+(multiplier*0.5))+")'/>";
	
	const PLAQUE_OFFSETS=[[(multiplier*0.5),multiplier],[0,(multiplier*0.5)],[(multiplier*0.5),0],[multiplier,(multiplier*0.5)]];
	output+="<style>.plaque{fill:#FF7F7F;font:"+(multiplier*0.6)+"px bolder;font-family:monospace;stroke:black;stroke-width:3px;paint-order:stroke}</style>";
	if(kol.getProperty("vr1637_printPlaques")=="true"){
		kol.print("\"plaques\": "+JSON.stringify(data.plaques));
	}
	for(plaque of data.plaques){
		output+="<text x='"+(multiplier*plaque.x+PLAQUE_OFFSETS[plaque.f][0])+"' y='"+(multiplier*plaque.y+PLAQUE_OFFSETS[plaque.f][1])+"' text-anchor='middle' dominant-baseline='middle' class='plaque'>"+plaque.icon.substring(5,6).toUpperCase()+"</text>";
		if(kol.getProperty("vr1637_printPlaques")=="true"){
			kol.print("("+plaque.x+","+plaque.y+"): "+plaque.icon.substring(5,6).toUpperCase()+plaque.f);
		}
	}
	
	output+="</svg>";
	if (kol.getProperty("vr1637_saveSvg") == "true") {
		kol.bufferToFile(output,"rose_garden_map.svg");
		kol.print("Map written to data/rose_garden_map.svg","blue");
	}
	let button = `<script>
	// Source - https://stackoverflow.com/a/23667012
	// Posted by ace
	// Retrieved 2026-10-01, License - CC BY-SA 3.0

	var svgStr = ${JSON.stringify(output)};

	function svgToImage() {
		var img = new Image();
		img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);

		img.onload = function () {
			var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			canvas.getContext("2d").drawImage(img, 0, 0);

			var link = document.createElement("a");
			link.download = "rose_garden_map.png";
			link.href = canvas.toDataURL("image/png");
			link.click();
		};
	}

	function showSVG() {
		let x = document.createElement("div");
		x.innerHTML = svgStr;
		let svg = x.firstChild;

		svg.style = "max-width:90%;max-height:90%";

		x.style = "position:fixed;inset:0;z-index:99999";
		x.onclick = () => x.remove();
		document.body.append(x);
	}
	</script>
	<div style="position:absolute;right:0;top:0;z-index:9999;display:flex">
		<textarea>${kol.myName() + "\t" + JSON.stringify(data.plaques)}</textarea>
		<button onclick="showSVG()">Show map</button>
		<button onclick="svgToImage()">Save map</button>
	</div>`;

	pageText = pageText.replace("</body>", button + "</body>");
	kol.write(pageText);
}
