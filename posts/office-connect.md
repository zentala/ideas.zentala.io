# Proposed idea to develop

Let's imagine our Warsaw office. We can find there:

1. coffee machine  
2. microwave  
3. owen  
4. dishwasher  
5. fridge  
6. water dispenser

Typical modern kitchen in the office.

I propose a smart ecosystem for those office kitchens. 

Let's separate the new, blue market, from this customer segment.

Let's provide them a bit different value proposition. 

Let's target the unique and specific needs of this consumer segment. 

Let's generate some additional value from the kitchen ecosystem, not separated machines only. 

Let's develop and release the series of those kitchen machines dedicated in particular to the offices.

All devices from the series would have such hardware features as NFC and BLE.

With extended communication, we could easily implement a group of features,

that will make office appliances more convenient and useful for office users.

Everyone in the Warsaw office has an NFC card, that could be easily paired with the BSH kitchen ecosystem.

In cases where NFC cards are not available, we could leverage NFC or BLE of the user's mobile phone to access kitchen appliances. 

One proposition doesn't require user data at all. 

# Live use cases scenarios

You (as an office "user") should be able to:

### **Get a notification when your microwave/oven task is done**

Story (I am seeing it as a story for ads, that can be video/board/animation/whatever) :

1. putting something in the oven for 20 minutes before launch,  
2. touching your NFC card to the microwave reader  
3. coming back to work (your desk),  
4. seeing the live status of the task on the computer screen, in the popup that appears after clicking the icon in the notifications bar  
   1. video transmission from the oven (camera),  
   2. temperature,  
   3. time progress bar,  
   4. the desktop app would be better in this case, because using mobile phones disturbs and we want to keep focused  
   5. but still, the mobile app is required and needed, we don't need to come back to the desk to get the notification  
5. working in the middle time focussed \- BSH is keeping eye on your food while you can keep yours on your job (having some ML and alarms in owens would be great too)  
6. receiving an alarm when the task is done, stopping work, going to the kitchen  
7. in case if user forget there is an alarm or something, even someone can check whos it is and bring him to the table 

### **Remember about the food you left in the office fridge** 

1. put something in the fridge, close it, and close up your card to the reader to match food with your account  
2. adding a screen to the fridge would be useful for manual cross-checking of food-detection  
3. the image recognition system will recognize what changed and keep continue tracking your food; the system also detects when food is removed;  
4. some kind of API or slack plugin for higher logic like (that should be customizable, and have open API, but should allow to easily implement this logic in the company):  
   1. notifications when food too long in the fridge  
   2. the automatic message every Friday 3 PM for everyone who still has food in the fridge  
   3. notification if and when your food was thrown away   
5. that also partially solves the problem of stilling food in some offices, in particular, if we will add electromagnetic lock and users will have to touch the card to open it (that can be configurable & optional)  
6. the only question then is how to exclude something from my list and made it public (or keep public always eg. milk when using lock)  
7. you can also use the screen to display the list of fridge users and their items, and how long those items are already inside  
8. implementing in in the offices, having-cross checking and heavy load (offices fridges are usually often used), would help us to provide awesome data that will improve ML algorithms  
9. user should have a plugin on the computer where he will be reminded about food left in the fridge (reducing food waste). he could have status with one click

### **Sub-story: smart cups (additional but important integration)** 

Story:

All cups/mugs/glasses had on the bottom passive RFID tags (easy to stick). The cost of one tag in this range (10cm) is small (10 euro cents? \- to check). 

Coffee machines and water dispensers have embedded RFID active readers, so they can read those tags, that contain information about the type, size, and maybe even others.

When you locating cups/mugs/glasses on the machines (coffee machine/water dispenser),

the machine detects the size of the cup from the RFID tag and automatically adjusts (scale) the amount of liquid to dispense.

Let's provide a new kind of experience. 

Amount a coffee in your cup is always exactly as it should be.

Not too less, not too much. Just perfect size.

Who will not love it? 

I know, it's a small detail.

**But** it matters when it comes to coffee.

Everything matters when it comes to coffee.

Experience matters when it comes to coffee. 

No more too much coffee dispensed to the cup (dirty cup).

Do you know the feeling of being afraid that your big coffee will be "too big" for this cup (when using the machine first times)?

I \- personally \- hate it. Someone should address this problem.

I know, I know... it's a 1st world problem. 

But I will appreciate it. I believe other clients also. 

Probably millennials like me will appreciate it.

We want experiences. This is the experience that I want. 

"Just click a button and trust in B/S/H."

No more repeating tasks to make another coffee, just to fulfill the whole cup (when you choose a bigger one).  

The coffee size is scalable or adjusted to the cup size. 

Just click a button and trust in B/S/H.

With B/S/H smart office magic will happen automagically (smile)

So you can focus on your work. (camera showing people focused on the business conversation when coffee machine is making just a perfect sized coffee).

It will be easy to implement in the offices, as most cups are reusable and RFID tags can preserve extreme temperatures.

We can stick tags even to new cups with some glue and they will preserve long.

If you have your own cup we can add to your cup a custom RFID tag so your cup will be also detected.

That is "just a cool feature" in the office, but in the restaurant is a time-saver, that matters in scale. 

Barista can just put a proper size cup on the machine and just choose the program, and the machine will know how much liquid should be dispensed.

We could even match different programs to the different shapes of cups. Not sure if it makes sense but it would made making coffe totally automated. 

In the case of self-service self-checkount, one machine could dispanse a cup with RFID tag and another \- coffe machine \- would just make a coffe that is matching to the size of the cup.


We can build pretty much on top of that.

* You could scale liquid amount by a percentage that is relative to the physical volume of mug/cup/glass that you really keep in your hand. That's a pretty awesome mix of the real and virtual world. That's a pretty intuitive expereience. Not sure about you, but I would like to feel so deeply integrated with reality.   
* using some touchscreen on the machine or galka  
* your private coffee receipt can be scaled to the size of the cup or mug,  
  considering even how high (to the edges) you want your coffee to have   
* you can have in the office 3 size of mugs.  
  coffe machine with embbed RFID reader and the coffee machine will automatically make coffee based on data from RFID attached tag  
* That could be nicely visualized. We could even had a graphic of every coup on the server. You can get cup size from RFID, why not whole uniqe model number?

We need track stuff to measure it and improve. To build something on top of those data. 

### **Make your favourite coffee just by touching your NFC card to the machine**

1. Set your favorite cafe and make it using different machines and BSH kitchens  
2. Or even customize buttons in machines, so you could have few customized cafes ready to make by default  
3. You should be able to customize ze the amount of cafe, water, milk, etc.   
4. migrate your settings between machines and offices and even companies or have it "under" those structures, somewhere directly on BSH account  
5. Story: I am going kitchen, just closing my badge to the machine and I just receive my favorite cafe, amount of interactions with machine limited (+COVID), distraction limited too (attention is currency, it costs, so we want to reduce attention cost so employees can focus on work and get a better experience in the same time)   
6. Story: I am visiting another company with BSH kitchen and I am using the same app and receipt to make my favourite caffe. BSH \- everywhere like at home.

dishwasher

1. get a notification when task is done, useful even if used by cleaning stuff, optimize their time  
2. we would have a nfc reader in the diswasher, and track the items inside (not sure why yet, just as possibility)

water dispenser

1. close up your card to get favourite water (my choice would be a lot of sparkling water)  
2. connected with smart-cups

# Tech behind

We will do it via NFC.

But we are not gonna create any mobile app.

We will leverage NFC to recognise users.

We should be also able to do the same with the office badge.

We will use web notifications to inform user when task is done. 

User can scan a QR code with his phone to allow for notification.

User will configure his account with the tablet provided.

I propose to use Electron.js & React Material UI & some tablet with NFC support or USB NFC reader.

# User story

Go to tablet, put you phone next to NFC reader. 

Set your favourite caffe. Save your settings. 

Authorise for web notifications. 

Go to coffee machine. Close your phone to the reader. Your coffee should start now.

Go to the microwave. Close your phone to the reader. Start any task. You should get notification when task is done. 

# Additional features

Stats. Who drinked biggest amount of coffee (smile) 

Suggestions to hydrate if you drink too much coffee.

Live view of the microwave task. 

(that is idea from BSH: you can make your custom coffe and 

Any other ideas for the offices? 

I propose to optimize this office scenario, in order to provide a new kind of user experience.


Let's focus on the M2M, connected things, living experience,


On the market of connected things (where B/S/H for sure is), the value for the client is an automated living experience. 

We want to automate the reality all around us, so we could focus on what's really important. 

We want to feel good at work so we could make our creative job better. 

We want to focus on the job, don't jump between tasks if not neccessary.

Your employee attention is the currency.

You want to give him experience where he can stay focussed on his job, having out of his mind the office logistics and 

# Goals

Celem nie jest robienie prototypu.

Celem nie jest zmienianie hardware. 

Celem jest przekonanie zarzadzu, Boscha i Simiena aby to zoribc.

Celem jest opracowanie prezentacji ktora do tego przekona.

Market: office kitchens all over the world 

Proposed solution: smart office ecosystem

This is a blue market, no one is aiming it yet, but something will soon.

Offered value: 

Basically this is all about defining a new standard of (smart) living. This time in the offices. 

Providing smart experience, not just a tool, machine.

Selling ecosystem, not a single product.  

