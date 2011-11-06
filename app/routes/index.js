/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log(servers);
  res.render('index', { title: 'Express' });
};