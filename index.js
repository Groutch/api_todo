
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  
var express = require('express'); 

// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var port = process.env.PORT || 80 

var app = express();
var myRouter = express.Router();
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*const MongoClient = require('mongodb').MongoClient;
const uri_db = "mongodb+srv://Groutch:1086@cluster0-tsdzz.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri_db, { useNewUrlParser: true });
client.connect(err => {
	const collection = client.db("db_todo").collection("line");
	// perform actions on the collection object
	console.log(collection);
	client.close();
});
*/
var db_user = "Groutch";
var mongoose = require('mongoose'); 
//var options = { keepAlive: 300000, connectTimeoutMS: 30000, useNewUrlParser: true, useUnifiedTopology: true  };
var options = { keepAlive: 300000, connectTimeoutMS: 30000, useNewUrlParser: true, useUnifiedTopology: true  };
//var urlmongo = "mongodb+srv://"+db_user+":1086@cluster0-tsdzz.gcp.mongodb.net/db_todo";
var urlmongo = process.env.MONGOLAB_URI 
mongoose.connect(urlmongo, options);
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
	console.log("Connexion à la base OK"); 
});
var taskSchema = mongoose.Schema({
    name: String, 
    show: Boolean, 
    by: String  
}); 
var Task = mongoose.model('Task', taskSchema);

myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
	res.json({message : "Bienvenue sur mon API ", methode : req.method});
});

myRouter.route('/tasks')
.get((req,res)=>{
	Task.find((err,tasks)=>{
		if(err){
			res.send(err);
		}
		res.json(tasks);
	});
	
})
.post((req,res)=>{
      var task = new Task();
    // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
      task.name = req.body.name;
      task.show = req.body.show;
      task.by = db_user;
    //Nous stockons l'objet en base
      task.save(function(err){
        if(err){
          res.send(err);
        }
        res.send({message : 'Bravo, la tache est maintenant stockée en base de données'});
      })
});

myRouter.route('/tasks/:task_id')
.put(function(req,res){ 
	Task.findById(req.params.task_id, function(err, task) {
		if (err){
			res.send(err);
		}
			task.name = req.body.name;
			task.show = req.body.show;
			task.by = db_user;
			task.save(function(err){
				if(err){
					res.send(err);
				}
				// Si tout est ok
				res.json({message : 'Bravo, mise à jour des données OK'});
			});                
		});
})
.delete(function(req,res){ 
	Task.remove({_id: req.params.task}, function(err, task){
        if (err){
            res.send(err); 
        }
        res.json({message:"Bravo, tache supprimée"}); 
    }); 
});

app.use(myRouter);
// Démarrer le serveur 
const server = app.listen(process.env.PORT || 8080, (req, res) =>
	console.log('Server Ready')
);
