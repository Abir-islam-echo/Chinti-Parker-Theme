/* PDP Ticker banner */
if ($('.ticker-carousel')) {
    $('.ticker-carousel').owlCarousel({
        animateIn: 'flipInX',
        items: 1,
        margin: 0,
        stagePadding: 0,
        smartSpeed: 450,
        loop: true,
        dots: false,
        autoplay: true,
        mouseDrag: false

    });
    $(window).on('focus', function () {
        $('.owl-next').trigger('click');
    });
}

/* PDP Notification ribbon */
setTimeout(function(){
  if($('.notification-carousel')){
  let slideSpeed=Number(document.querySelector('#notificationRibbon').dataset.time);
      $('.notification-carousel').owlCarousel({
          animateIn: 'flipInX',
          items:1,
          margin:0,
          stagePadding:0,
          smartSpeed:450,
          loop:true,
          dots:false,
          autoplay:true,
          autoplaySpeed:2500,
          autoplayTimeout:slideSpeed,
          mouseDrag:false,
        autoRefresh: false
      });
  
      $(window).on('focus', function () {
            $('.notification-carousel .owl-next').trigger('click');
      });
    
  }

}, 2000);

//color swatch functionality start

var doit = 0;

let colourSwatch=function (){
  let gridItem=document.querySelectorAll('.product-grid .item');
  gridItem.forEach((item)=>{
    let swatchItem=item.querySelectorAll('#colourSwatches li');
    if(swatchItem.length>11){
      item.querySelector('#colourSwatches .more-colour').classList.add('more-colur-block');
    }
    if(swatchItem.length==3){
      item.querySelector('#colourSwatches .more-colour').classList.add('two-colur-block-mobile');
    }

    if(window.innerWidth <= 768){
       if(swatchItem.length > 4){
      item.querySelector('#colourSwatches .more-colour').classList.add('more-colur-block');
       }
    }

     if(window.innerWidth > 768 && swatchItem.length <= 11 && item.querySelector('#colourSwatches .more-colour')){
       if(swatchItem.length >= 4){  
         item.querySelector('#colourSwatches .more-colour').classList.remove('more-colur-block');
       }   
    }
    
     swatchItem.forEach((item) => {
      let bg = item.querySelector('.swatchBlock') && item.querySelector('.swatchBlock').style.backgroundColor;
      if (item.querySelector('.tooltip')) {
          item.querySelector('.tooltip').style.backgroundColor = bg;
          let tempBg=bg.replace('(',' ');
          tempBg=tempBg.replace(')',' ');
          tempBg=tempBg.replace('rgb',' ');
          tempBg=tempBg.split(",");
          if(tempBg[0]>200 && tempBg[1]>200 && tempBg[2]>200){
              item.querySelector('.tooltip').style.color = '#000';
          }
      }
    });
  }); 
};
document.querySelectorAll('.product-grid .item').length>0 && colourSwatch();

 window.addEventListener('resize', function () {
        clearTimeout(doit);
        doit = setTimeout(colourSwatch, 100);
      });
//color swatch functionality end





