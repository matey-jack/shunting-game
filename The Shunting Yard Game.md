# **The Shunting Yard Game**

Aim of the game: bring all railway cars to their destination tracks with as little moves as possible.  
The player is working with a yard fan of stub sidings, which are all connected on one side to the head shunt (drill track).  
A “move” consists of the shunting locomotive (with all the cars that are currently coupled to it) driving into one of the sidings, coupling or uncoupling some cars there (obviously only from the side of track that the locomotive is facing, which is always the side of the head shunt), and then driving back to the head shunt.  
The yard has a fixed number S of sidings in each game (level) and each siding (as well as the head shunt) can take N railway cars.

### **Game Display**

On the left of the screen display the sidings each as a horizontal line with a label to its left and the cars on the line. (The line itself doesn’t need to be visible.) Each siding (track) should have a label on its left. Labels are capital letters starting from A, B, … and so on. Each siding/label should also have a color (possibly background color the label). Cars on the track are just rectangles painted in the color of their destination (target) track and labeled on the car with the letter of the target track. Make sure that cars with their labels look different from the actual label of the track\! (Maybe the track label’s background color shape should not be rectangular but round or elliptic or a square standing on its corner, i.e. turned by 45°.)  
To the right of the sidings is the head shunt (drill track). The locomotive and cars currently attached to it should always be displayed there.  
On the top of the screen, display a status bar with the following numbers (and matching labels):

* Shunting steps already performed.  
* Number of cars already on their destination track, not counting cars that have been on the correct target track already at the start.  
* Number of cars still not on their destination track.

### **Game Play**

It’s all about execution shunting steps:

1. The player can click on a car in a siding to move this car and all the cars to its right will be moved (instantly or with a short animation) to the head shunt. If this would put more than N cars on the head shunt, nothing will be moved, and a small animated exclamation mark should be flashed between the siding and the head shunt, accompanied with a bass key sound that reminds the player of rejection.  
2. The player can also click on a car in the head shunt to move this car (and all cars to its left) into its destination siding provided that it has enough room. (No more than N cars in each siding\!) In the latter case, show the same rejection animation and sound as above. (If successful, this changes the   
3. Finally, the player can drag and drop some cars from the left side of the head shunt to any of the sidings with the same effect as the single click (except that the target track of the move is selected explicitly by the drop location). Same restriction (max. N cars) and feedback as in other moves applies.

Each of the three moves increases the “shunting step counter” (in top of screen status bar) by one.

### **Level Design**

A level of the game as specified in a simple textual format:

* the first line says “maxCars: \<number\>” where \<number\> is the N mentioned above.  
* each further line has the name of a track (siding) as first character, then a colon, then simply more letters, each representing the target siding of a single car.  
* optionally there can be space characters before or after each car letter.

Several levels can be read from a single text file with the levels separated by three dash/hyphen characters.  
Example level file:  

	maxCars: 5  
	A: bcabc  
	B: bcdd  
	C: ddd  
	D: abcd  
	---  
	maxCars: 3  
	A: bb  
	B: cca  
	C: aa  

There should be a set of levels of increasing size and difficulty in the app. Also a button to paste a level description into the app and then play that level.

### **Tech Stack**

Create a new app using TypeScript, Vite, and Preact. Use simple rectangular divs or SVG shapes to symbolize the rail cars and locomotive. Use additional JavaScript libraries only if they bring benefits of more than a small function that could be part of the app’s code directly. Write unit test for any helper functions that have a clear input/output contract and a somewhat complex functionality.