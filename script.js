chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {


	chrome.storage.local.get(function (story) {
		window.story = story;
		//console.log(window.story);
	})

	// получаем настройки
	chrome.storage.sync.get(null, function (options) {

		window.options = options;

		get_url("http://amserver.ru/amextension.php?domen=" + domen, site_info);

		// проверка индексации страниц в яндекс и гугл
		if (options['checkpage'] & 1) get_url("https://yandex.ru/yandsearch?text=url%3A" + urlc + "%20%7C%20url%3Awww." + urlc, yandex_page);
		if (options['checkpage'] & 2) get_url("https://www.google.com/search?q=site%3A" + urlc, google_page);


		if (options['fontsize'] && options['linksbox']) {
			document.getElementById('main').style.fontSize = options['fontsize'];
			document.getElementById('linksbox').innerHTML = options['linksbox'];

			replace_main();

		} else {
			store_default();
		}

	});


	var url = tabs[0].url;
	var title = tabs[0].title;

	//console.log(tabs[0]);

	var urlc = url.replace(/https?:\/\/(www\.)?/g, '');

	//console.log('url = '+url);

	// получаем домен
	var a = document.createElement('a');
	a.href = url;
	var domen = a.hostname;
	domen = domen.replace('www.', '');



	// обновляем в коде
	function replace_main() {
		var main = document.getElementById('main');
		var str = main.innerHTML;
		str = str.replace(/{domen}/g, domen);
		str = str.replace(/{url}/g, url);
		str = str.replace(/{title}/g, title);
		str = str.replace(/{urlc}/g, urlc);
		main.innerHTML = str;
	}


	/**
	 * Обновляем Яндекс ИКС
	 */
	get_url('https://webmaster.yandex.ru/siteinfo/?host=' + domen, function (str) {

		console.log('yandex_iks', str);
		var found = str.match(/sqi":([0-9\s]*),/);
		var yandex_iks = found[1].replace(/[^0-9]/,'');

		// парсим отзывы, рейтинг сайта
		const match = str.match(/"siteRating"\s*:\s*({[^}]+})/);
		if (match) {
			const siteRating = JSON.parse(match[1]); 
			// console.log(siteRating); 
			if (siteRating.totalCount){
				yandex_iks = yandex_iks+' <sup style="font-size:x-small;"><b>'+ siteRating.totalCount +'</b> ' + declOfNum(siteRating.totalCount,['отзыв','отзыва','отзывов']) + ' [<span style="color:green;">' +siteRating.positiveCount+ '</span> / <span style="color:red;"> ' +siteRating.negativeCount+ '</span>]' + '</sup>';
			}
		}

		//store_history('yandex_iks_'+domen, yandex_iks);
		//title_story('yandex_iks',domen);

		//console.log(found);

		document.getElementById('yandex_iks').innerHTML = yandex_iks;

	});



	// // яндекс тиц
	// get_url( "http://bar-navig.yandex.ru/u?url=http://"+domen+"&show=1", yandex_tic);

	// function yandex_tic (str){
	// 	var found = str.match(/tcy rang="([0-9]*)" value="([0-9]*)"/);
	//   	var yandex_tic = found[2];

	//   	var yafound = str.match(/url domain="(.*)"/);
	//   	var mirror = yafound[1];
	//   	mirror = mirror.replace(/https:\/\//g, '');

	//   	if (mirror && mirror!=domen && mirror!='www.'+domen) document.getElementById('yandex_mirror').innerHTML = '<br><span style="color:black;font-size:11px;">[зеркало: <a style="color:red;" target="_blank" href="http://'+mirror+'">'+mirror+'</a>]</span>';


	//   	if (found[2]==0 && found[1]==1) yandex_tic='<font color="red">АГС</font>';

	// 		store_history('yandex_tic_'+domen,yandex_tic);

	//   	document.getElementById('yandex_tic').innerHTML = yandex_tic;

	// 		title_story('yandex_tic',domen);

	// }


	// индекс страницы в яндексе
	function yandex_page(str) {

		if (!str || str.match(/(captcha|Вы не робот)/i)) {
			document.getElementById('yap').style.color = 'orange';
			return false;
		}

		if (str.match(/(ничего не нашлось|ничего не нашли)/i)) {
			document.getElementById('yap').style.color = 'red';
		} else {
			document.getElementById('yap').style.color = 'green';
			document.getElementById('yap').style.fontWeight = 'bold';
			console.log('Нашли страницу!');
		}


	}

	// индекс страницы в google
	function google_page(str) {

		if (!str || str.match(/captcha/i)) {
			document.getElementById('gop').style.color = 'orange';
			return false;
		}

		if (str.match(/(ничего не найдено|did not match any documents)/i)) {
			document.getElementById('gop').style.color = 'red';
		} else {
			document.getElementById('gop').style.color = 'green';
			document.getElementById('gop').style.fontWeight = 'bold';
		}

	}


	// яндекс индекс через выдачу
	get_url("https://yandex.ru/search/?text=site:" + domen, yandex_index);
	function yandex_index(str) {

		// console.log('yandex_index HTML', str)
		//var found = str.match(/нашлось (.*) ответов/);
		//var found = str.match(/"found":"(.+?)ответ/);
		var found = str.match(/(?:нашлось|нашёлся|нашлась)(.+?)(результат|ответ)/);
		if (found) {
			var yandex_index = found[1];
			yandex_index = yandex_index.replace('—\\n', '');
			yandex_index = yandex_index.replace('тыс.', '000');
			yandex_index = yandex_index.replace('млн', '000000');
			yandex_index = yandex_index.replace(/[^\/\d]/g, '');
		}

		if (str.match(/ничего не нашлось/)) {
			var yandex_index = 0;
		}

		if (!str || str.match('/captcha/')) {
			var yandex_index = 'Error';
		}

		//if (yandex_index != 'Error') store_history('yandex_index_' + domen, yandex_index);

		document.getElementById('yandex_index').innerHTML = yandex_index;

		//title_story('yandex_index', domen);

	}

	// google индекс через выдачу
	get_url("https://www.google.com/search?q=site:" + domen, google_index);
	function google_index(str) {

		if (!str || str.match(/captcha/i)) {
			document.getElementById('google_index').style.color = 'orange';
			return false;
		}

		var found = str.match(/(?:примерно|Результатов:|About) (.+?)</);
		if (found) {
			var google_index = found[1];
			google_index = google_index.replace(/[^\/\d]/g, '');
		}

		if (str.match(/ничего не найдено/)) {
			var google_index = 0;
		}
		if (str == 'undefined') {
			var google_index = 'Error';
		}

		if (!str) {
			var google_index = 'Error';
		}

		//if (google_index != 'Error') store_history('google_index_' + domen, google_index);

		document.getElementById('google_index').innerHTML = google_index;

		//title_story('google_index', domen);

	}


	// возраст домена через nic.ru
	if (domen.match(/.ru/)) {
		// whois используем через site_info быстрее и надежнее
		//get_url( "https://www.nic.ru/whois/?query=" + domen, whois_nic);
	} else {
		//document.getElementById('vozrast').innerHTML = '';
	}
	//get_url( "https://www.reg.ru/whois/?dname=" + domen, whois_nic);

	function whois_nic(str) {


		var found = str.match(/(created|Creation).+?([0-9]{4}.[0-9]{2}.[0-9]{2})/);
		if (found) {
			var whois_created = found[2];
			var d1 = new Date(whois_created);
			var dn = new Date();


			var dmonth = (dn.getMonth() - d1.getMonth());
			var dyear = (dn.getFullYear() - d1.getFullYear());
			var dday = (dn.getDate() - d1.getDate());

			if (dday < 0) {
				dday += 30;
				dmonth -= 1;
			}

			if (dmonth < 0) {
				dmonth += 12;
				dyear -= 1;
			}

			var result = '';

			if (dyear > 0) result = dyear + ' ' + declOfNum(dyear, ['год', 'года', 'лет']) + ' ';
			if (dday > 0 && dmonth > 0) result += dmonth + ' мес. ';
			result += dday + ' ' + declOfNum(dday, ['день', 'дня', 'дней']);

			result += ' <small>[' + d1.getDate() + '.' + (d1.getMonth() < 9 ? '0' : '') + '' + (d1.getMonth() + 1) + '.' + d1.getFullYear() + ']</small>';

		}

		if (typeof result != 'undefined') document.getElementById('whois_created').innerHTML = result;
	}

	// информация о сервере
	function site_info(str) {
		var info = JSON.parse(str);
		var docinfo = "<a target='_blank' href='https://www.reg.ru/whois/?dname=" + info['ip'] + "'>" + info['ip'] + "</a> <small>[" + info['host'] + "]</small>";
		if (info['whois']) {

			whois_nic(info['whois']);

			if (options['show_whois'] == true){

				var width = getComputedStyle(document.getElementById("main")).width;
				var whois_info = "<pre style='max-width:" + width + "!important;overflow:scroll;font-size:11px;line-height:11px;'>" + info['whois'] + "</pre><hr>";

				document.getElementById('site_info').innerHTML = whois_info;

			}

		}
		document.getElementById('site_ip').innerHTML = docinfo;
	}


});


function get_url(url, callfunc) {

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			callfunc(xhr.responseText);
		}
	}
	xhr.send();

}


function store_default() {

	chrome.storage.sync.set({
		fontsize: 16,
		linksbox: document.getElementById('linksbox').innerHTML.trim()
	}, function () { document.getElementById('main').innerHTML = "<b>Привет, вебмастер!</b><br><br><img height='64' align='left' src='https://cdn4.iconfinder.com/data/icons/general10/png/128/wizard.png'>Спасибо за проявленный интерес к расширернию 'SeoMagic'.<br><br>Расширение установлено и готово к работе!<br><br>Если захотите что-то изменить - перейдите в раздел <a target='_blank' href='/options.html'>настройки</a>.<br><br>   <a href='/popup.html'>Приступить к работе >>></a>"; }
	);

}


// function store_history(key, value) {

// 	var element = [Math.floor(Date.now() / 1000), value];

// 	chrome.storage.local.get(function (storage) {


// 		if (typeof (story[key]) !== 'undefined' && story[key] instanceof Array) {

// 			var len = story[key].length;
// 			var last_element = story[key][len - 1];
// 			if (last_element[1] == value) {
// 				console.log('value equal');
// 				return true;
// 			}
// 			console.log('last_element:' + last_element);

// 			story[key].push(element);
// 		} else {
// 			// first
// 			story[key] = [element];
// 		}
// 		chrome.storage.local.set(story);
// 		console.log(story);

		
// 	});


// }

// function title_story(attr, domen) {

// 	var story = 'История ' + attr + ':';
// 	for (var key in window.story[attr + '_' + domen]) {
// 		var info = window.story[attr + '_' + domen][key];
// 		var date = new Date(info[0] * 1000);
// 		date = date.getDate() + "." + ('0' + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear();
// 		story = story + "\n" + date + " :: " + info[1];
// 	}

// 	document.getElementById(attr).title = story;

// }



function declOfNum(number, titles) {
	cases = [2, 0, 1, 1, 1, 2];
	return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}
