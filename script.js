	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {

		// получаем настройки
		chrome.storage.sync.get(null,function (options) {

			// проверка индексации страниц в яндекс и гугл
			if (options['checkpage']&1) get_url( "https://yandex.ru/yandsearch?text=url%3A"+urlc+"%20%7C%20url%3Awww."+urlc, yandex_page);
			if (options['checkpage']&2) get_url( "https://www.google.ru/search?q=site%3A"+urlc, google_page);


			if (options['fontsize'] && options['linksbox']){
	        	document.getElementById('main').style.fontSize = options['fontsize'];
	        	document.getElementById('linksbox').innerHTML = options['linksbox'];

	        	replace_main();

	        } else {
	        	store_default();
	        }

	    });


		var url = tabs[0].url;
	    var title = tabs[0].title;

	    console.log(tabs[0]);

	    var urlc = url.replace(/https?:\/\/(www\.)?/g,'');

		//console.log('url = '+url);

	    // получаем домен
	    var a      = document.createElement('a');
        a.href = url;
        var domen = a.hostname;
        domen = domen.replace('www.','');



        // обновляем в коде
        function replace_main(){
		    var main = document.getElementById('main');
		    var str = main.innerHTML;
		    str = str.replace(/{domen}/g, domen);
		    str = str.replace(/{url}/g, url);
		    str = str.replace(/{title}/g, title);
		    str = str.replace(/{urlc}/g, urlc);
		    main.innerHTML = str;
		}

		// яндекс тиц
		get_url( "http://bar-navig.yandex.ru/u?url=http://"+domen+"&show=1", yandex_tic);

		function yandex_tic (str){
			var found = str.match(/tcy rang="([0-9]*)" value="([0-9]*)"/);
		  	var yandex_tic = found[2];

		  	var yafound = str.match(/url domain="(.*)"/);
		  	var mirror = yafound[1];

		  	if (mirror && mirror!=domen && mirror!='www.'+domen) document.getElementById('yandex_mirror').innerHTML = '<br><span style="color:black;font-size:11px;">[зеркало: <a style="color:red;" target="_blank" href="http://'+mirror+'">'+mirror+'</a>]</span>';


		  	if (found[2]==0 && found[1]==1) yandex_tic='<font color="red">АГС</font>';

		  	document.getElementById('yandex_tic').innerHTML = yandex_tic;	
		}
		

		// индекс страницы в яндексе
		function yandex_page(str){

			if (!str || str.match('/captcha/')){
				document.getElementById('yap').style.color='orange';
				return false;
			}	

			if (str.match(/ничего не нашлось/)){
				document.getElementById('yap').style.color='red';
			} else {
				document.getElementById('yap').style.color='green';
				document.getElementById('yap').style.fontWeight='bold';
			}


		}

		// индекс страницы в google
		
		function google_page(str){

			if (!str){
				document.getElementById('gop').style.color='orange';
				return false;
			}

			if (str.match(/ничего не найдено/)){
				document.getElementById('gop').style.color='red';
			} else {
				document.getElementById('gop').style.color='green';
				document.getElementById('gop').style.fontWeight='bold';
			}
	

		}



		// яндекс индекс через выдачу
		get_url( "https://yandex.ru/search/?text=site:" + domen, yandex_index);
		function yandex_index(str){

			//var found = str.match(/нашлось (.*) ответов/);
			//var found = str.match(/"found":"(.+?)ответ/);
			var found = str.match(/(?:нашлось|нашёлся|нашлась)(.+?)(результат|ответ)/);
			if (found){
				var yandex_index = found[1];
				yandex_index  = yandex_index.replace('—\\n','');
				yandex_index  = yandex_index.replace('тыс.','000');
				yandex_index  = yandex_index.replace('млн','000000');
				yandex_index  = yandex_index.replace(/[^\/\d]/g,'');
			}	

			if (str.match(/ничего не нашлось/)){
				var yandex_index = 0;
			}

			if (!str || str.match('/captcha/')){
				var yandex_index='Error';
			}	

			document.getElementById('yandex_index').innerHTML = yandex_index;	
		}

		// google индекс через выдачу
		get_url( "https://www.google.ru/search?q=site:" + domen, google_index);
		function google_index(str){
			
			var found = str.match(/(?:примерно|Результатов:) (.+?)</);
			if (found){
				var google_index = found[1];
				google_index  = google_index.replace(/[^\/\d]/g,'');
			}

			if (str.match(/ничего не найдено/)){
				var google_index = 0;
			}

			if (!str){
				var google_index='Error';
			}
			

			document.getElementById('google_index').innerHTML = google_index;	
		}


		// возраст домена через nic.ru

		if (domen.match(/.ru/)){
			get_url( "https://www.nic.ru/whois/?query=" + domen, whois_nic);
		} else {
			document.getElementById('vozrast').innerHTML = '';
		}
		//get_url( "https://www.reg.ru/whois/?dname=" + domen, whois_nic);
		
		function whois_nic(str){
			
			
			var found = str.match(/(created|Creation).+?([0-9]{4}.[0-9]{2}.[0-9]{2})/);
			if (found){
				var whois_created = found[2];
				var d1 = new Date(whois_created);
				var dn = new Date();
				

				var dmonth = (dn.getMonth()-d1.getMonth());
				var dyear = (dn.getFullYear()-d1.getFullYear());
				var dday = (dn.getDate()-d1.getDate());

				if (dday<0){
					dday+=30;
					dmonth-=1;
				}

				if (dmonth<0) {
					dmonth+=12;
					dyear-=1;
				}

				var result = '';

				if (dyear>0) result = dyear + ' ' + declOfNum(dyear,['год','года','лет']) + ' ';
				if (dday>0 && dmonth>0) result += dmonth + ' мес. ';
				result += dday + ' '+declOfNum(dday,['день','дня','дней']);

				result += ' <small>['+d1.getDate()+'.'+(d1.getMonth()<9?'0':'')+''+(d1.getMonth()+1)+'.'+d1.getFullYear()+']</small>';

			}

			document.getElementById('whois_created').innerHTML = result;	
		}


		// информация о сервере
		get_url( "http://amserver.ru/amextension.php?domen=" + domen, site_info);

		function site_info(str){
			var info = JSON.parse(str);
			document.getElementById('site_ip').innerHTML = "<a target='_blank' href='https://www.reg.ru/whois/?dname="+info['ip']+"'>"+info['ip']+"</a> <small>["+info['host']+"]</small>";	
		}


	});


	function get_url(url,callfunc){

		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		  	callfunc(xhr.responseText);		    
		  }
		}
		xhr.send();

	}


	function store_default(){

		chrome.storage.sync.set({
		    fontsize: 16,
		    linksbox: document.getElementById('linksbox').innerHTML.trim()
		  }, function() { document.getElementById('main').innerHTML = "<b>Привет, вебмастер!</b><br><br><img height='64' align='left' src='https://cdn4.iconfinder.com/data/icons/general10/png/128/wizard.png'>Спасибо за проявленный интерес к расширернию 'SeoMagic'.<br><br>Расширение установлено и готово к работе!<br><br>Если захотите что-то изменить - перейдите в раздел <a target='_blank' href='/options.html'>настройки</a>.<br><br>   <a href='/popup.html'>Приступить к работе >>></a>"; }
		 );

	}



	function declOfNum(number, titles) {  
	    cases = [2, 0, 1, 1, 1, 2];  
	    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
	}
