
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <title>Dynamic Digit Slot Machine</title>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
//     <style>
//         :root {
//             --gold-bg: linear-gradient(180deg, #d4af37 0%, #f1d36e 50%, #b8860b 100%);
//             --red-panel: #8b0000;
//         }

//         body { 
//             margin: 0; background: #111; height: 100vh;
//             display: flex; justify-content: center; align-items: center; 
//             font-family: Arial, sans-serif;
//         }

//         #machine {
//             min-width: 400px;
//             background: var(--gold-bg);
//             border: 6px solid #8a6d3b;
//             border-radius: 12px;
//             padding: 30px;
//             box-shadow: 0 40px 80px rgba(0,0,0,0.8);
//         }

//         .header {
//             display: flex; justify-content: space-between;
//             margin-bottom: 30px; color: #332200; font-weight: bold;
//         }

//         .display-box {
//             background: #000; color: #00ff00; padding: 5px 12px;
//             border: 2px solid #444; font-family: monospace; font-size: 20px;
//         }

//         #slot-container {
//             background: #1a1a1a;
//             padding: 15px;
//             display: flex;
//             justify-content: center;
//             gap: 8px;
//             border: 10px solid #222;
//         }

//         /* Individual block styling */
//         .reel-column {
//             width: 80px; height: 120px;
//             background: var(--red-panel);
//             overflow: hidden;
//             position: relative;
//             border: 2px solid #000;
//             box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
//         }

//         .digit-strip {
//             position: absolute; width: 100%;
//             display: flex; flex-direction: column; text-align: center;
//         }

//         .digit {
//             height: 120px; font-size: 100px; line-height: 120px;
//             color: #efefef; font-weight: bold;
//             text-shadow: 2px 4px 6px rgba(0,0,0,0.5);
//         }
//     </style>
// </head>
// <body>

// <div id="machine">
//     <div class="header">
//         <div>Date & Time: <span class="display-box">01:30</span></div>
//         <div>Lucky Voters No: <span class="display-box">30</span></div>
//     </div>
    
//     <div id="slot-container">
//         </div>
// </div>

// <script>
//     /** * DYNAMIC CONFIGURATION
//      * The script detects the length of the first string to set reel count.
//      **/
//     const NUMBER_STACK = ["12345678", "078314", "99228811", "1234", "000000"]; 
//     const PAUSE_TIME = 4000; // Time in ms to wait before next number
    
//     let stackIndex = 0;
//     const digitHeight = 120;
//     const container = document.getElementById('slot-container');
//     let reels = [];

//     function initReels() {
//         container.innerHTML = ''; // Clear existing
//         reels = [];
        
//         // Use the first item in stack to determine how many reels to build
//         const reelCount = NUMBER_STACK[stackIndex].length;

//         for (let i = 0; i < reelCount; i++) {
//             const column = document.createElement('div');
//             column.className = 'reel-column';
            
//             const strip = document.createElement('div');
//             strip.className = 'digit-strip';
            
//             // Build the long strip of digits (0-9 repeated for infinite scroll effect)
//             let content = '';
//             for(let set=0; set<3; set++) {
//                 for(let digit=0; digit<10; digit++) {
//                     content += `<div class="digit">${digit}</div>`;
//                 }
//             }
//             strip.innerHTML = content;
            
//             column.appendChild(strip);
//             container.appendChild(column);
//             reels.push(strip);
//         }
//     }

//     function rollToNext() {
//         const targetString = NUMBER_STACK[stackIndex];
        
//         // Safety check: if stack item length changed, rebuild reels
//         if (targetString.length !== reels.length) {
//             initReels();
//         }

//         const digits = targetString.split('');

//         digits.forEach((digit, i) => {
//             const targetVal = parseInt(digit);
//             // Spin into the second set of numbers (index 10-19) for smooth rolling
//             const targetY = -( (targetVal + 10) * digitHeight );

//             gsap.to(reels[i], {
//                 y: targetY,
//                 duration: 1.5 + (i * 0.3), // Staggered finish for realism
//                 ease: "back.out(1.4)",      // Professional bounce/snap effect
//                 onComplete: () => {
//                     if (i === reels.length - 1) {
//                         setTimeout(advanceStack, PAUSE_TIME);
//                     }
//                 }
//             });
//         });
//     }

//     function advanceStack() {
//         // Reset positions to the first set (0-9) instantly to prepare for next spin
//         reels.forEach(strip => {
//             const currentY = parseFloat(gsap.getProperty(strip, "y")) || 0;
//             const resetY = currentY % (digitHeight * 10);
//             gsap.set(strip, { y: resetY });
//         });

//         stackIndex = (stackIndex + 1) % NUMBER_STACK.length;
//         rollToNext();
//     }

//     // Initial Start
//     initReels();
//     setTimeout(rollToNext, 500); 
// </script>

// </body>
// </html>