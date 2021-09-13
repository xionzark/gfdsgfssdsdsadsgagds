const notificationAnnouncements = true;
const consoleAnnouncements = false;
const stockerLoopFrequency = 30 * 1000 // seconds converted into milliseconds

var stockList = {
    check: 'dump eet',
    goods: []
}

var market = Game.ObjectsById[5].minigame.goodsById;	// read market
for (let i = 0; i < market.length; i++){
    stockList.goods.push({
        name: market[i].name,
        stock: market[i].stock,
        restingPrice: 10*(i+1) + Game.ObjectsById[5].level - 1,
        currentPrice: market[i].val,
        mode: market[i].mode,
        lastMode: -1,
        priceBought: -1,
    });
}
console.log('=====$$$== Stocking list created');

var stockerLoop = setInterval(function() {

    Game.ObjectsById[5].minigame.tick();	
        // if you uncomment the line of code above - the logic loop will force the market to tick every time it triggers,
        // making this an obvious cheat, and i will personally resent you.
        
        // but
        // if you backup your save and set stockerLoopFrequency to like 10 milliseconds it looks very fun and effective.

    market = Game.ObjectsById[5].minigame.goodsById;	// update market
    for (let i = 0; i < market.length; i++){
        stockList.goods[i].currentPrice = market[i].val;
        stockList.goods[i].mode = market[i].mode;
        stockList.goods[i].stock = market[i].stock;
        if ((stockList.goods[i].mode != stockList.goods[i].lastMode))	// new mode detected
        {
            let md = stockList.goods[i].mode;
            let lmd = stockList.goods[i].lastMode;
            if (consoleAnnouncements) {
                console.log(stockList.goods[i].name + ' has changed the mode from [' + modeDecoder[stockList.goods[i].lastMode] + '] to [' + modeDecoder[stockList.goods[i].mode] + ']');
                console.log(stockList.goods[i].name + ' price is ' + (stockList.goods[i].currentPrice - stockList.goods[i].restingPrice).toFixed(2) + ' compared to its resting price')
            }

            if (	// buy conditions
                (
                    (lmd == 2) && ((md !=4) && (md!=5)) ||
                    (lmd == 4) && ((md !=2) && (md!=5))	||
                    (lmd == 5) && ((md !=2) && (md!=4))
                )
                && (stockList.goods[i].currentPrice < stockList.goods[i].restingPrice)
            )
            {
                stockList.goods[i].priceBought = stockList.goods[i].currentPrice;
                if (consoleAnnouncements) console.log('=====$$$== Buying '+ stockList.goods[i].name);
                Game.ObjectsById[5].minigame.buyGood(i,10000);

                if (notificationAnnouncements) Game.Notify('Buying ' + stockList.goods[i].name,'At ' + (stockList.goods[i].priceBought).toFixed(2) + ' $ per unit',goodIcons[i]);

            }
            if (	// sell conditions
                (
                    (lmd == 1) && ((md !=3) && (md!=5))	||
                    (lmd == 3) && ((md !=1) && (md!=5))	||
                    (lmd == 5) && ((md !=1) && (md!=3))
                )
                && (stockList.goods[i].currentPrice > stockList.goods[i].restingPrice)
            )
            {
                if (consoleAnnouncements) ('=====$$$== Selling '+ stockList.goods[i].name +' at a profit of ' + (stockList.goods[i].currentPrice - stockList.goods[i].priceBought).toFixed(2));
                stockList.goods[i].priceBought = -1;
                Game.ObjectsById[5].minigame.sellGood(i,10000);
                if (notificationAnnouncements) Game.Notify('Selling ' + stockList.goods[i].name,(stockList.goods[i].currentPrice - stockList.goods[i].priceBought).toFixed(2) + '$ profit',goodIcons[i]);

            }

            stockList.goods[i].lastMode = stockList.goods[i].mode	// update last mode
        }
    }
},stockerLoopFrequency);