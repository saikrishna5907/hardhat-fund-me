function processData(input) {
  //Enter your code here
  const lines = input.toString().split("\n");
  let totalGold = 0;
  let agreedPeopleToBuy = 0;
  const data = lines[0].split(" ");
  agreedPeopleToBuy = data[0];
  totalGold = data[1];

  const offers = [];

  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(" ");
    const x = { amount: parseInt(data[0]), grams: parseInt(data[1]) };
    if (x.amount) {
      offers.push(x);
    }
  }
  console.log(offers);
  let totalOfferedGrams;

  if (totalOfferedGrams < totalGold) {
    return "Got caught!";
  }
  const sortByPrice = offers.sort((a, b) => b.amount - a.amount);
  console.log(sortByPrice);

  const potentialOffers = [];
  sortByPrice.map((offer) => {
    //  find next best offer
    const secondOffer = sortByPrice.find(
      (off) => off.grams + offer.grams === totalGold
    );
    potentialOffers.push({ offer, potentialOffers: secondOffer });
  });
  console.log(potentialOffers);
}

const input = `
4 10
460 4
590 6
550 5
590 5
`;
processData(input);
