// ===========================================================================================
/*			
		Hello there.
	This is the console version of the CookiStocker mod.
	To use it, sinply copy-paste the entire thing in your Cookie Clicker console.
	If you have any questions about the algorithm at hand or are having troubles running it
	- you can just ask Gingerguy#2580 for help on discord on steam guide comments.
		https://steamcommunity.com/sharedfiles/filedetails/?id=2599187047
*/

//		Version 1.3

// 			Options

		// Announce transactions in game notifications
		const stockerTransactionNotifications = true

		// Make regular profit reports
		const stockerActivityReport = true
			// How often to make regular reports in ms (one hour by default)
			const stockerActivityReportFrequency = 60 * 60 * 1000

		// Make game notifications fade away on their own
		const stockerFastNotifications = false

		// Use console.log
		const stockerConsoleAnnouncements = false

		// Logic loop frequency; do not touch it unless you are cheating.
		const stockerLoopFrequency = 30 * 1000

		const stockerGreeting = 'click clack you are now in debt'

// ===================================================================================

if (!stockList) {
	var stockList = {
		check: 'dump eet',
		goods: [],
		sessionStart: new Date(),
		sessionProfits: 0,
		sessionPurchases: 0,
		sessionSales: 0
	}
}

var modeDecoder = ['stable','slowly rising','slowly falling','rapidly rising','rapidly falling','chaotic'] // meanings of each market trend (good.mode)
var goodIcons = [[2,33],[3,33],[4,33],[15,33],[16,33],[17,33],[5,33],[6,33],[7,33],[8,33],[13,33],[14,33],[19,33],[20,33],[32,33],[33,33],];

function stockerTimeBeautifier(duration) {
	var milliseconds = Math.floor((duration % 1000) / 100),
	  seconds = Math.floor((duration / 1000) % 60),
	  minutes = Math.floor((duration / (1000 * 60)) % 60),
	  hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
	  days = Math.floor((duration / (1000 * 60 * 60 * 24)));
  
	days = (days < 10) ? "0" + days : days;
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
  
	return days + ":" + hours + ":" + minutes + ":" + seconds;
  }

Game.registerMod("gincookistocker",{
	init:function(){

		this.startStocking();
	},
	startStocking:function(){
		if (!Game.ObjectsById[5].minigame) {
			console.log('=====$$$== Stock Market minigame has not initialised yet! Will try again in 500 ms.');
			setTimeout(() => {
				this.startStocking();
			},500);
			return
		}
		else {
			console.log('=====$$$== CookiStocker logic loop initialised');
			Game.Notify(`CookiStocker is ready`,stockerGreeting,[1,33],false);
			console.log(stockList.check);
		}
		
		var market = Game.ObjectsById[5].minigame.goodsById;	// read market
		for (let i = 0; i < market.length; i++){
			stockList.goods.push({
		 		name: market[i].name,
		 		stock: market[i].stock,
		 		restingPrice: 10*(i+1) + Game.ObjectsById[i].level - 1,
		 		currentPrice: market[i].val,
				mode: market[i].mode,
				lastMode: -1,
		 		priceBought: -1,
			});
		}
		console.log('=====$$$== Stocking list created');

		if (stockerActivityReport) {
			var stockerReportInterval = setInterval(function() {
				var stockerUptime = new Date() - stockList.sessionStart;
				if ((stockList.sessionPurchases + stockList.sessionSales) == 0) {
					Game.Notify(
						'CookiStocker report',
						'This session has been running for ' + stockerTimeBeautifier(stockerUptime) +
						', but has not found any good investment opportunities yet! Luck is not on your side, for now.'			
						,[26,7],stockerFastNotifications
					);
				} else {
					Game.Notify(
						'CookiStocker report',
						'This session has been running for ' + stockerTimeBeautifier(stockerUptime) +
						', and has made ' + stockList.sessionProfits.toFixed(0) +
						'$ in ' + stockList.sessionPurchases + ' purchases and ' + stockList.sessionSales + ' sales'			
						,[26,7],stockerFastNotifications
					);
				}
			},stockerActivityReportFrequency);
		}

		var stockerLoop = setInterval(function() {

			//Game.ObjectsById[5].minigame.tick();	
				// if you uncomment the line of code above - the logic loop will force the market to tick every time it triggers,
				// making this an obvious cheat, and i will personally resent you.
				
				// but
				// if you backup your save and set stockerLoopFrequency to like 10 milliseconds it looks very fun and effective.

			market = Game.ObjectsById[5].minigame.goodsById;	// update market
			for (let i = 0; i < market.length; i++){
				//let i = 3;
				stockList.goods[i].stock = market[i].stock;
				stockList.goods[i].currentPrice = market[i].val;
				stockList.goods[i].mode = market[i].mode;
				stockList.goods[i].stock = market[i].stock;
				if (
					(stockList.goods[i].mode != stockList.goods[i].lastMode) // new trend detected
					&& (Game.ObjectsById[i+2].amount > 0)					// in a stock that is active
				)
				{
					let md = stockList.goods[i].mode;
					let lmd = stockList.goods[i].lastMode;
					if (stockerConsoleAnnouncements) {
						console.log(stockList.goods[i].name + ' has changed the mode from [' + modeDecoder[stockList.goods[i].lastMode] + '] to [' + modeDecoder[stockList.goods[i].mode] + ']');
					}

					if (	// buy conditions
						(stockList.goods[i].priceBought == -1)	// only if the stock was not bought before
						&&
						(
							(lmd == 2) && ((md !=4) && (md!=5)) ||	// slow fall stopped
							(lmd == 4) && ((md !=2) && (md!=5))	||	// fast fall stopped
							(lmd == 5) && ((md !=2) && (md!=4))		// chaotic stopped
						)
						&&
						(stockList.goods[i].currentPrice < stockList.goods[i].restingPrice)	// only if the price is lower than resting price
					)
					{
						// buying
						stockList.goods[i].priceBought = stockList.goods[i].currentPrice;
						Game.ObjectsById[5].minigame.buyGood(i,10000);
						stockList.sessionProfits -= stockList.goods[i].currentPrice*Game.ObjectsById[5].minigame.goodsById[i].stock;
						stockList.sessionPurchases++;
						if (stockerTransactionNotifications) Game.Notify('Buying ' + stockList.goods[i].name,'The price has stopped ' + modeDecoder[stockList.goods[i].lastMode] + ' at ' + Math.floor(stockList.goods[i].priceBought) + '$ per unit, and the price is now ' + modeDecoder[stockList.goods[i].mode] + '.',goodIcons[i],stockerFastNotifications);
						if (stockerConsoleAnnouncements) console.log('=====$$$== Buying '+ stockList.goods[i].name);
					}

					if (	// sell conditions
						(stockList.goods[i].priceBought > -1)	// only if the stock was bought before
						&&
						(
							(lmd == 1) && ((md !=3) && (md!=5))	||	// slow rise stopped
							(lmd == 3) && ((md !=1) && (md!=5))	||	// fast rise stopped
							(lmd == 5) && ((md !=1) && (md!=3))		// chaotic stopped
						)
						&& (stockList.goods[i].currentPrice > stockList.goods[i].restingPrice)	// only if the price is higher than resting price
					)
					{
						// selling
						stockList.goods[i].priceBought = -1;
						stockList.sessionProfits += stockList.goods[i].currentPrice*stockList.goods[i].stock;
						Game.ObjectsById[5].minigame.sellGood(i,10000);
						stockList.sessionSales++;
						if (stockerTransactionNotifications) Game.Notify('Selling ' + stockList.goods[i].name,'At a profit of ' + Math.floor(stockList.goods[i].currentPrice - stockList.goods[i].priceBought) + '$ per unit (total ' + Math.floor(stockList.goods[i].currentPrice - stockList.goods[i].priceBought)*stockList.goods[i].stock + '$ profit), and the price is now ' + modeDecoder[stockList.goods[i].mode] + '.',goodIcons[i],stockerFastNotifications);
						if (stockerConsoleAnnouncements) ('=====$$$== Selling '+ stockList.goods[i].name +' at a profit of ' + (stockList.goods[i].currentPrice - stockList.goods[i].priceBought).toFixed(2));

					}

					if (lmd == !5 && md == 5) {	// ignore unstable stocks
						if (stockerTransactionNotifications) Game.Notify(stockList.goods[i].name + ' went unstable','Ignoring the stock for a time',[1,33],stockerFastNotifications);
					}

					stockList.goods[i].lastMode = stockList.goods[i].mode	// update last mode
				}
			}
		},stockerLoopFrequency);
	},
});
