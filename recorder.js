   //declaration des variables
   let toogleBtn=document.querySelector('#Toggle');
   let navigation=document.querySelector('nav');
   let LogContainer=document.querySelector('ul');
   let resetLog=document.querySelector('#resetLog');
   let copyrightYear=document.querySelector('#copyYear');
   let record=document.querySelector('#record');
   let stopRec=document.querySelector('#stop');
   let canvas=document.querySelector('canvas');
   let files=document.querySelector('#filesBox');
   let recordId=0;
   //on desactive le bouton stop si il n'y a pas de record en cours
   stopRec.disabled=true;

   //creation de la visualisation
   let audioCtx;
   const canvasCtx=canvas.getContext('2d');

    //log config
    function setLog(log){
       let date=new Date();
       let logTimeH=date.getHours();
       let logTimeMin=date.getMinutes();
       let logTimeSec=date.getSeconds();
       let logItem=document.createElement('li');
       logItem.textContent=`${logTimeH}:${logTimeMin}:${logTimeSec} ${log}`;
       LogContainer.appendChild(logItem);
    }

   //main
   if (navigator.mediaDevices.getUserMedia) {
       let log1='getUserMedia suported';
       setLog(log1);
       const constraints={audio:true};
       let patern=[];

       let onSuccess=function(stream){
           let mediaRecorder = new MediaRecorder(stream);

           visualize(stream);

           record.onclick=function(){
               mediaRecorder.start();
               let log2=mediaRecorder.state;
               let log3='recorder started';
               setLog(log2);
               setLog(log3);
               record.style='background:red';

               stopRec.disabled=false;
               record.disabled=true;
           }

           stopRec.onclick=function(){
               mediaRecorder.stop();
               let log4=mediaRecorder.state;
               let log5='recorder stopped';
               setLog(log4);
               setLog(log5);
               record.style='background:goldenrod';

               stopRec.disabled=true;
               record.disabled=false; 
           }
           mediaRecorder.onstop=(e)=>{
               let log6='data available after mediaRecorder.stop() called';
               setLog(log6);
               const clipName=prompt('renommer l\'enregistrement');

               const clipContainer=document.createElement('div');
               const clipLabel=document.createElement('p');
               clipLabel.className='clipLabel';
               const audio=document.createElement('audio');
               const deleteBtn=document.createElement('button');

               clipContainer.classList.add('clip');
               audio.setAttribute('control','');
               deleteBtn.textContent='X';
               deleteBtn.className='delete';

               if (clipName===null||clipName=='') {
                   recordId+=1;
                   clipLabel.textContent="rec 0"+recordId;
                   let log7='clip named by default value';
                   setLog(log7);
               }else{
                clipLabel.textContent=clipName;  
                let log7='clip named succesfuly';
                setLog(log7);
               }
               clipContainer.appendChild(clipLabel);
               clipContainer.appendChild(audio);
               clipContainer.appendChild(deleteBtn);
               files.appendChild(clipContainer);

               audio.controls=true;
               const blob = new Blob(patern, {'type' : 'audio/ogg: codecs=opus'});
               patern=[];
               const audioUrl = window.URL.createObjectURL(blob);
               audio.src=audioUrl;
               let log8='record stopped';
               setLog(log8);

               deleteBtn.onclick=(e)=>{
                    let eventTarget=e.target;
                    eventTarget.parentNode.parentNode.removeChild(eventTarget.parentNode);  
                    let log9=`clip ${clipLabel.textContent} are deleted`;
                    setLog(log9);
               }

               clipLabel.onclick=()=>{
                    const existingName=clipLabel.textContent;
                    const newClipName=prompt('renommer l\'enregistrement');
                    if (newClipName===null||newClipName=='') {
                        clipLabel.textContent=existingName;
                    }else{
                        clipLabel.textContent=newClipName;  
                        let log10=`clip ${existingName} are renamed ${clipLabel.textContent}`;
                        setLog(log10);
                    }
               }
           }
           mediaRecorder.ondataavailable=(e)=>{
               patern.push(e.data);
           }
       }
       let onError=(err)=>{
           let log11='une erreur est survenue '+err;
           setLog(log11);
       }
       navigator.mediaDevices.getUserMedia(constraints).then(onSuccess,onError);
   }else{
       let log12='getUserMedia not suported';
       setLog(log12);
   }
   //log resetting
   resetLog.onclick=()=>{
       LogContainer.innerHTML='';
   }
   function visualize(stream) {
       if (!audioCtx) {
           audioCtx = new AudioContext(); 
       }

       const source=audioCtx.createMediaStreamSource(stream);

       const analyser=audioCtx.createAnalyser();

       analyser.fftSize=2048;

       const bufferLength=analyser.frequencyBinCount;

       const dataArray=new Uint8Array(bufferLength);

       source.connect(analyser);

       draw();

       function draw() {
           const WIDTH=canvas.width;
           const HEIGHT=canvas.height;

           requestAnimationFrame(draw);

           analyser.getByteTimeDomainData(dataArray);

           canvasCtx.fillStyle='rgb(0, 0, 0)';
           canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

           canvasCtx.lineWidth=3;
           canvasCtx.strokeStyle='rgb(218, 165, 32)';

           canvasCtx.beginPath();

           let sliceWidth = WIDTH*1.0/bufferLength;
           let x=0;

           for (let i = 0; i < bufferLength; i++) {
               
            let v=dataArray[i]/128.0;
            let y=v*HEIGHT/2;

            if (i===0) {
                canvasCtx.moveTo(x,y);
            }else{
                canvasCtx.lineTo(x,y);
            }

            x+=sliceWidth;
           }

           canvasCtx.lineTo(canvas.width,canvas.height/2);
           canvasCtx.stroke();
       }
   }

   //copyright update
   let date=new Date();
   copyrightYear.textContent=date.getFullYear();

   //navigation
   toogleBtn.onclick=()=>{
       navigation.classList.toggle('show');
       if (navigation.classList.contains('show')) {
           toogleBtn.textContent='X';
           toogleBtn.style='font-size: 1.5em !important;top:22px';
       }else{
           toogleBtn.textContent='?';
           toogleBtn.style='top:0px !important';
           toogleBtn.style='font-size: 2.5em !important';
       }
   }
