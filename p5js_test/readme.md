This was a test demo to show the validity of my idea for having the player essentially navigate a 3d matrix using these color speech bubbles. The loop is as follows

//Pseudocode let's go
//The entire game is navigating a 3d matrix of red, green and blue)

// Stolen from here https://www.30secondsofcode.org/js/s/euclidean-distance/
const euclideanDistance = (a, b) =>
  Math.hypot(...Object.keys(a).map(k => b[k] - a[k]));

originColor=rgb($random,$random,$random); //Assign 
targetColor=rgb($random,$random,$random);
currentColor=originColor;
targetBubblesCount=3;//This sets 
targetBubblesArray=[]; //I forget how arrays work this instantiates a new empty array idk if I can do that
while(currentColor!=targetColor)
{
	for(i=0;i++;i<targetBubblesCount)
	{
		// Right now this algorithm might fall into the trap of getting close but not being able to get "into the hole", I need to find a way to have it kind of "slow down" and get more accurate as
		// One gets closer
		generateTargetBubble
		{
			targetBubblesArray.add = [currentColor.r +- (1-20),currentColor.g +- (1-20),currentColor.b +- (1-20)];
			var isDuplicate=false;
			for(j=0;j++;i<targetBubblesArray.length-1)
			{
				if(targetBubblesArray[i].location==targetBubblesArray[j]) isDuplicate=true;
			}
			if(isDuplicate) generateTargetBubble; //Recursive logic so that if the color generated is identical to any others then it will regenerate until one is not identical to any other
			else return(targetBubblesArray.add); //I'm realizing targetBubblesArray.add in this context is wrong but who cares you get the point
		}
		targetBubblesArray[i].id=i;
		targetBubblesArray[i].distance = euclidianDistance(targetColor, targetBubblesArray[i]);
	}
	
	targetBubblesArrayClone=targetBubblesArray;
	sort(targetBubblesArrayClone by value distance);//You get what I mean, a sorting algorith goes here
	for(i=0;i++;i<targetBubblesArray.length)
	{
		targetBubblesArray[i].rank=0; //The end result is that no rank should actually be 0, a rank of 0 indicates a math error, possible values should be 1-targetBubblesCount
		for(j=0;j++;j<targetBubblesArrayClone.length)
		{
			if(targetBubblesArray[i].id=targetBubblesArrayClone[j].id)  targetBubblesArray[i].rank=j+1;
		}
	}
	
	for(i=0;i++;i<targetBubblesArray.length)
		Print("Option "+i+": "+ColorBox(targetBubblesArray.r,targetBubblesArray.g,targetBubblesArray.b));

	waitOnClickReact //The script hangs until one of the options is clicked
	{
		if(clickedItem.rank==1) goblinSay.Happy(); //The rank of 1 is the best possible response
		else if(clickedItem.rank==targetBubblesCount) goblinSay.Mad(); //The highest rank is the worst possible response
		else goblinSay.Confused(); // If neither the best nor the worst thing is said, the goblin is simply confused. Optimized for 3-4 speech options tbqh.
	}
	
	//Let's start this loop all over again baby!
}

goblinSay.YouWin();
