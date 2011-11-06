(function($){
	/*
	 * socket settings
	 */
	var parseUrl = location.href.match(/^(https?:\/\/.+?)\//);
	var path = parseUrl[1];
	
	var socket = io.connect(path);
	var $tpl = $([
		'<tr class="output_line">',
		'	<th></th>',
		'	<td class="msg"></td>',
		'	<td class="time"></td>',
		'</tr>'
	].join("\n"));
	
	var showVolume = 50;
	
	//document ready
	$(function(){
		/*
		 * Global Doms
		 */
		var $body = $('body');
		var $boxes = $('div.output');
		var $gNav = $('ul#globalNavigation');
		var $sVol = $('ul#showVolumes');
		var outputBoxes = {};
		
		var firstBoxFlag = false;
		$boxes.each(function(){
			if(firstBoxFlag){
				$(this).hide();
			}else{
				firstBoxFlag = true;
			}
		});
		
		socket.on('tail', function(data){
			if(data.msg !== null && data.msg !== undefined){
				regs = data.msg.toString().match(/^>>>(.+?)>>> (.+)/);
				if(regs !== null){
					host = regs[1];
					msg  = regs[2];
				}else{
					host = 'unknown';
					msg = data.msg;
				}
				
				var $newLine = $tpl.clone();
				var date = new Date();
				$('th', $newLine).text(host);
				$('td.msg', $newLine).text(msg);
				$('td.time', $newLine).text(
					date.getFullYear()  + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
				);
				
				if(outputBoxes[data.server] === undefined || outputBoxes[data.server] === null){
					outputBoxes[data.server] = $('div#' + data.server);
				}
				
				var $tbody = $('table tbody', outputBoxes[data.server]);
				$tbody.append($newLine);
				
				var $rows = $('tr', $tbody);
				while($rows.length > showVolume){ 
					$($rows[0]).remove();
					$rows = $('tr', $tbody);
				}
			}
		});
		
		$('a.indivisual', $gNav).click(function(){
			var $this = $(this);
			var targetID = $this.attr('href').replace(/^#/, '');
			$boxes.each(function(){
				var $this = $(this);
				var myID = $(this).attr('id');
				if(myID == targetID){
					$this.slideDown();
				}else{
					$this.slideUp();
				}
			});
			return false;
		});
		
		$('a.all', $gNav).click(function(){
			var $this = $(this);
			$boxes.slideDown();
			return false;
		});
		
		$('a.dummy', $gNav).css('cursor', 'default');
		$('a.dummy', $gNav).click(function(){
			return false;
		});
		
		$('a.showVolume', $sVol).click(function(){
			var $this = $(this);
			showVolume = parseInt($this.attr('data-volume'));
			$('li.active', $sVol).removeClass('active');
			$this.parents('li').addClass('active');
			return false;
		});
		
		
	});
})(jQuery);
