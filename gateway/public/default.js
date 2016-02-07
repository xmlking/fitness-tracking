
window.onload = function () {

      var socket = io.connect('/iot');

       var heart =  document.getElementById("heart");
       
       socket.on('data', function (data) {
           console.log(data);
           switch(data.tags.sensor) {
               case 'hr':
                   var pulse = 60/data.values.value/2;
                   document.getElementById("label").innerText = data.values.value + " bpm";

                   heart.style.transition = "transform " + pulse + "s ease-in-out, opacity " + pulse + "s ease-in-out";
                   break;
               case 'st':
                   console.log(data);
                   break;
               default:
                   console.log(data);
           }

      });
       
      heart.addEventListener("transitionend", loopTransition, false);
      heart.className = "stateTwo";
      
      function loopTransition(e) {
      if (e.propertyName == "opacity") {
            if (heart.className == "stateTwo") {
                  heart.className = "stateOne";
            } else {
                  heart.className = "stateTwo";
            }
      }
      }

};

