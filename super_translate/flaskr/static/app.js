window.addEventListener('DOMContentLoaded', (event) => {
     let fromBtns = document.querySelectorAll(".lang-from");
     let toBtns = document.querySelectorAll(".lang-to");

     let selectFrom = document.querySelector("#selectfrom");
     let selectTo = document.querySelector("#selectto");

     let fromFree= document.getElementById("from_global");
     let toFree= document.getElementById("to_global");


     let textToTranslate = document.getElementById("translatetxt");
     let translateBtn = document.getElementById("translatebtn");

     let translatedText = document.getElementById("translatedtext");

     let notifymessage = document.getElementById("notifymessageid");



     class  TranslatorHolder {
        constructor() {
        this.tolang = "";
        this.fromlang = "";
        this.text = 0;
        this.len = 0;
        this.ready = false;
        }
     };


     let translatorHolder = new TranslatorHolder();


     /**************** Selection Part Start  ***************************/
       /* function to select lang  and add active class */
       const langSelect = (event)=> {
       let btnLang = event.target.getAttribute("data-lang");
       let btnWay = event.target.getAttribute("data-way");
       let apidir = event.target.getAttribute("data-dir");
       let btndir = (apidir == 'left_to_right') ? 'ltr' : 'rtl';

         if (!event.target.classList.contains('active')) {
             let oppsiteWay = (btnWay === 'to') ? 'from' : 'to';


              // set text aread direction
              document.querySelector(`textarea[data-way=${btnWay}]`).setAttribute("dir", btndir);

             // other button data
             let otherActive = document.querySelector(`button.active[data-way=${oppsiteWay}]`);
             if (otherActive) {
               if (otherActive.getAttribute("data-lang") == btnLang){
                   otherActive.classList.remove('active');
                   oppsiteWay === 'to' ? translatorHolder.tolang = '' :
                   translatorHolder.fromlang = '';
                   translatorHolder.ready = false;
                } else {
                   translatorHolder.ready = true;
                }
             }

             let oldActive = document.querySelector(`button.active[data-way=${btnWay}]`);
             if (oldActive) {
                  oldActive.classList.remove('active');
                  document.querySelector(`textarea[data-way=${btnWay}]`).value = "";
             };
             event.target.classList.add('active');
             btnWay === 'to' ? translatorHolder.tolang = btnLang : translatorHolder.fromlang = btnLang;
         };

     };

     /* end of lang selection */


     /* Helper function to check ready */


     // Select input from
     const selectFromFunc = (event)=> {
        let selected = event.target.value.split(',')[0];
        let apidir = event.target.value.split(',')[1];
        let langcode = event.target.value.split(',')[2];
        let dir = (apidir == 'left_to_right') ? 'ltr' : 'rtl';

        if (selected != 0) {

          fromFree.innerText = selected;
          fromFree.setAttribute("data-lang", langcode);
          document.querySelector(`textarea[data-way=from]`).setAttribute("dir", dir);
          document.querySelector(`textarea[data-way=from]`).value = '';

          let otherActive = document.querySelector(`button.active[data-way=to]`);
          if (otherActive) {
             if (otherActive.getAttribute("data-lang") == langcode){
               translatorHolder.tolang = '';
               translatorHolder.ready = false;
               document.querySelector(`textarea[data-way=to]`).value = '';
               otherActive.classList.remove('active');
             } else {
               translatorHolder.ready = true;
             }
          }
        };

        let oldActive = document.querySelector(`button.active[data-way=from]`);
        if (oldActive) {
           oldActive.classList.remove('active');
           translatorHolder.fromlang = langcode;
           fromFree.classList.add("active");
        } else {

          translatorHolder.fromlang = langcode;
          fromFree.classList.add("active");
        }


     };
     const selectToFunc = (event)=> {
        let selected = event.target.value.split(',')[0];
        let apidir = event.target.value.split(',')[1];
        let langcode = event.target.value.split(',')[2];
        let dir = (apidir == 'left_to_right') ? 'ltr' : 'rtl';

        if (selected != 0) {
          toFree.innerText = selected;
          toFree.setAttribute("data-lang", langcode);

        document.querySelector(`textarea[data-way=to]`).setAttribute("dir", dir);
        document.querySelector(`textarea[data-way=to]`).value = '';

          let otherActive = document.querySelector(`button.active[data-way=from]`);
          if (otherActive) {
             if (otherActive.getAttribute("data-lang") == langcode){
               translatorHolder.fromlang = '';
               translatorHolder.ready = false;
               otherActive.classList.remove('active');
               document.querySelector(`textarea[data-way=from]`).value = '';
               document.querySelector(`textarea[data-way=from]`).setAttribute("dir", '');

             } else {
               translatorHolder.ready = true;
             }
          }
        };

        let oldActive = document.querySelector(`button.active[data-way=to]`);
        if (oldActive) {
           oldActive.classList.remove('active');
           translatorHolder.tolang = langcode;
           toFree.classList.add("active");
        } else {

          translatorHolder.tolang = langcode;
          toFree.classList.add("active");
        }
     };


      /**************** Selection Part End  ***************************/


     /* apply listener */

     fromBtns.forEach( (fbtn, findex)=> {
        fbtn.addEventListener( "click", langSelect);
     });

     toBtns.forEach( (tbtn, tindex)=> {
        tbtn.addEventListener( "click", langSelect);
     });

     selectFrom.addEventListener( "change",  selectFromFunc);
     selectTo.addEventListener( "change",  selectToFunc);


     // function send the translate request to the server
     const postData = async(url = '', data = {}) => {
       console.log("data sent to translated", data);
       const response = await fetch(url, {
         method: 'POST',
         credentials: 'same-origin',
         headers: {'Content-Type': 'application/json',},
         // Body data type must match "Content-Type" header
         body: JSON.stringify(data),
       });
       try {
         const serverResponse = await response.json();
         console.log("server response", serverResponse);
         return serverResponse;
       } catch (error) {
         console.log("error", error);
       }
     };

     const translate = async ()=> {

        let translateText = textToTranslate.value;
        let lentext = translateText.length;
        if (translateText.trim() == '') {
           return;
        }

       if (translatorHolder.ready){
         translatorHolder.len = lentext;
         let serverResponse = await postData('/translator', {
           text: translateText,
           source:translatorHolder.fromlang,
           target:translatorHolder.tolang,
           ready:translatorHolder.ready,
           len:translatorHolder.len
         });
         let data = await serverResponse;
         if (data.success){
           // if there was  a previous error hide and remove the message
           if (notifymessage.style.display == 'block'){
             notifymessage.display = "none";
             notifymessage.innertext= '';
           }
           // render the translated data into the text area
           translatedText.value = data.translation.translations[0].translation;
         } else {
           // if any error show it
           notifymessage.display = "block";
           notifymessage.innerText = data.message;
         }
       }
     };


     translateBtn.addEventListener("click", translate);

});
