var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var Market = require('../models/market');
var User = require('../models/user');
var Bet = require('../models/bet');

var object = {
	match : function(pside, pmarketname, pstudent, podds){
		Bet.find({"paired" : false, "settled":false, "market":pmarketname, "bet":pside, "student":pstudent, "odds": podds}, {_id:1, bet:1, market:1, odds:1, student:1, to_match:1, stake:1})
		.sort({createdAt : 1}).limit(1).exec(function(err, results){
		async.forEach(results, function(doc, callback){
			console.log("out");
			var id = doc._id;
			var stake = doc.stake;
			var odds = doc.odds;
			var market = doc.market;
			var student = doc.student;
			var side = doc.bet;
			var to_match = doc.to_match;
			var paired = doc.paired;
			Bet.find({"student":student, "odds":odds, "market":market, "paired":false, "settled":false, 
			"bet": {$ne : side}, "_id" : {$ne : id}}).sort({createdAt: 1}).limit(1).exec(function(errs, res){
			async.forEach(res, function(opp_doc, callback2){
				console.log("in");
				var temp_to_match = to_match;
				var opp_id = opp_doc._id;
				var opp_student = opp_doc.student;
				var opp_paired = opp_doc.paired;
				var opp_to_match = opp_doc.to_match;
				var opp_settled = opp_doc.settled;
				console.log("to_match: " + to_match);
				console.log("Is " + id + " lteq " + opp_id + " ???");
				console.log("Is " + temp_to_match + " lteq " + opp_to_match + " ???");
						var update_to_match = temp_to_match - opp_to_match;
						var update_opp_to_match = opp_to_match - temp_to_match;
						if(update_to_match <= 0){
							paired = true;
							update_to_match = 0;
						}
						if(update_opp_to_match <= 0){
							opp_paired = true;
							update_opp_to_match = 0;
						}
						Bet.findOneAndUpdate({"_id" : id}, 
							{$set : {'to_match': update_to_match,'paired' : paired}}
							,{new : true}).exec(function(err, res){
								if(err)
									throw err;
								if(res.to_match != 0){
									object.match(side, market, student, odds);
								}
								
							});
						Bet.findOneAndUpdate({"_id" : opp_id}, 
							{$set : {'to_match': update_opp_to_match, 'paired' : opp_paired}}
							,{new : true}).exec(function(err){
								if(err)
									throw err;
							});

						
						
			}, callback);
		}, function(err){
			console.log("done matching bets");
		})})});
	},
	update_odds_availability : function(){
		console.log("we in the funct");
	},
	calcReturns: function(x){
        if(x.bet == "Back"){
            x.potential_returns = x.stake * x.odds;
        }else{
            x.potential_returns = x.stake * 2;
        }
	},	
	static_calcReturns: function(bet, stake, odds){
        if(bet == "Back"){
            return stake * odds;
        }else{
            return stake + stake;
        }
	},
	cashout_value: function(x){
		var ret = parseFloat(object.static_calcReturns(x.bet, x.stake, x.odds));
		console.log("ret from static func: " +ret);
			Market.find({"marketname" : x.market, "student" : x.student, ltotal: {$gte : {ret}}}).sort({ltotal:-1}).limit(1)
			.exec(function(doc){
				console.log("doc " + doc);
				if(!doc.length){
					x.cashout = x.stake - 0.1;
					x.returns = -0.1;
				}else{
					if(x.bet == "Back"){
						var liability = Math.round((((doc[0].back * x.stake) - x.stake) * 100)/100);
				        var returns = x.stake * x.odds;
						var profit = returns - x.stake;
						var diff = profit - liability;
						var cashout_long = x.stake + (diff / doc[0].back);
						var cashout = Math.round(cashout_long * 100) / 100;
						var return_val = Math.round((cashout - x.stake) * 100)/100;
						x.cashout = cashout;
						x.returns = return_val;
					}else{
						var liability = Math.round((((doc[0].back * x.stake) - x.stake) * 100)/100);
				        var returns = x.stake + x.stake;
						var profit = returns - x.stake;
						var diff = profit - liability;
						var cashout_long = x.stake + (diff / doc[0].back);
						var cashout = Math.round(cashout_long * 100) / 100;
						var return_val = Math.round((cashout - x.stake) * 100)/100;
						x.cashout = cashout;
						x.returns = return_val;
					}
			}
			});
	},
	crazy: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname}).sort({btotal: -1}).limit(1)
			.then(function(doc){
				async.forEach(doc, function(x, callback){
                    updates.crazy(x);
                    callback();
                }, function(err){
                    if(err)
                        return console.log(err)
                    console.log("completed async");
                    res.render('test-env', {title: 'Test..', items: doc, user: req.user});
                });
				var res = doc[0];
				x.mostPopularOdds = res.back;
				x.mostPopularBtotal = res.btotal;
				console.log(x.student + " 1 popular back:  " + x.mostPopularOdds);
				Market.find({"student" : x.student, "marketname": x.marketname, "back" : {$lt : x.mostPopularOdds}}).sort({odds: -1}).limit(1)
			    .then(function(doc1){
			        		var res1 = doc1[0];
			        		if(res1 == null){
			        			x.valueBelowOdds = 0;
			        			x.valueBelowBtotal = 0;
			        		}else{
					            x.valueBelowOdds = res1.back;
					            x.valueBelowBtotal = res1.btotal;
					        }
					        console.log(x.student + " 2 popular back:  " + x.valueBelowOdds);
					        Market.find({"student" : x.student, "marketname": x.marketname, "lay" : {$gt : x.mostPopularOdds}}).sort({odds: 1}).limit(1)
				         	.then(function(doc2){
				         	var res2 = doc2[0];
				         	if(res2 == null){
				         		x.valueAboveOdds = 0;
				             	x.valueAboveLtotal = 0;
				         	}else{
				         		x.valueAboveOdds = res2.lay;
				             	x.valueAboveLtotal = res2.ltotal;
				         	}
							console.log(x.student + " 1 popular lay:  " + x.valueAboveOdds);
							Market.find({"student" : x.student, "marketname": x.market, "back" : {$gt : x.mostPopularOdds}}).sort({odds: 1}).skip(1).limit(1)
					         .then(function(doc3){
					         	var res3 = doc3[0];
					         	if(res3 == null){
					         		x.valueAboveAboveOdds = 0;
					             	x.valueAboveAboveLtotal = 0;
					         	}else{
					         		x.valueAboveAboveOdds = res3.lay;
					             	x.valueAboveAboveLtotal = res3.ltotal;
					         	}
								console.log(x.student + " 2 popular lay:  " + x.valueAboveAboveOdds);
					         });
				         });
				});
		});
	},
	findValue: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname}).sort({btotal: -1}).limit(1)
			.then(function(doc){
				async.forEach(doc, function(res, callback){
				x.mostPopularOdds = res.back;
				x.mostPopularBtotal = res.btotal;
				callback();
				}, function(err){
					if(err)
						console.log(err);
					console.log("findValue finished");
				});
			});
	},
	findValueBelow: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname}).sort({btotal: -1}).limit(1)
			.then(function(ret){
				async.foreach(ret, function(result, callback){
					var mostPopularBtotal = result.btotal;
					var mostPopularOdds = result.back;
					Market.find({"student" : x.student, "marketname": x.marketname, "back" : {$lt : mostPopularOdds}}).sort({odds: -1}).limit(1)
		        	.then(function(doc){
		        		async.foreach(doc, function(res, callback2){
			        		if(res == null){
			        			x.valueBelowOdds = 0;
			        			x.valueBelowBtotal = 0;
			        		}else{
					            x.valueBelowOdds = res.back;
					            x.valueBelowBtotal = res.btotal;
					        }
		        		}, callback);
			        });
				}, function(err){
					if(err)
						console.log(err);
					console.log("findValueBelow finished");
				});
				
			});
     	
	},
	findValueAbove: function(x){
		Market.find({"student" : x.student, "marketname": x.marketname}).sort({btotal: -1}).limit(1)
			.then(function(ret){
				var mostPopularBtotal = ret[0].btotal;
				var mostPopularOdds = ret[0].back;
	    		Market.find({"student" : x.student, "marketname": x.marketname, "lay" : {$gt : mostPopularOdds}}).sort({odds: 1}).limit(1)
	         	.then(function(doc){
	         	var res = doc[0];
	         	if(res == null){
	         		x.valueAboveOdds = 0;
	             	x.valueAboveLtotal = 0;
	         	}else{
	         		x.valueAboveOdds = res.lay;
	             	x.valueAboveLtotal = res.ltotal;
	         	}
				console.log(x.student + " newFindValueAbove");
	         });
	        });
	},
	findValueAboveAbove : function(x){
		Market.find({"student" : x.student, "marketname": x.marketname}).sort({btotal: -1}).limit(1)
			.then(function(ret){
				var mostPopularBtotal = ret[0].btotal;
				var mostPopularOdds = ret[0].back;
	    		Market.find({"student" : x.student, "marketname": x.market, "back" : {$gt : mostPopularOdds}}).sort({odds: 1}).skip(1).limit(1)
		         .then(function(doc){
		         	var res = doc[0];
		         	if(res == null){
		         		x.valueAboveAboveOdds = 0;
		             	x.valueAboveAboveLtotal = 0;
		         	}else{
		         		x.valueAboveAboveOdds = res.lay;
		             	x.valueAboveAboveLtotal = res.ltotal;
		         	}
				console.log(x.student + " newfindValueAboveAbove");
		         });
	    });
	             
	}
};

module.exports = object;

/*	
	Returns
	Winning Back Bet - 		(Stake * (Odds - 1)) + Stake 
	Losing Back Bet - 		Stake
	Winning Lay Bet -		Stake + Stake
	Losing Lay Bet -		Stake * (Odds - 1)

	Cashout Rules	
	Back bet placed at Odds X1 for stake Y1 with Profit Z1
	Lay at new Odds X2 for stake Y1 with Liability Z2
	Difference = Profit Z1 - Liability Z2
	Difference / Odds X2 = Cashout Value
	Stake Y2 = Y1 + Cashout Value
	Lay at New Odds X2 for Stake Y2

	Back/Lay Outcomes:
	1) Back bet Wins, Returns Z1 - Liability from Lay Bet = Cashout
	2) Lay bet Wins, Returns Stake Y2 Profit - Loss from Back Bet = Cashout
*/


/*
setInterval(function() {
},2500);
*/