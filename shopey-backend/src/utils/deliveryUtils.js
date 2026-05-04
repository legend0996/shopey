const calculateDelivery = (total, fragility, county) => {
  let fee = 0;

  // value-based
  if (total < 5000) fee = 190;
  else if (total < 10000) fee = 250;
  else if (total < 20000) fee = 320;
  else if (total < 40000) fee = 400;
  else fee = 700;

  // fragility
  if (fragility === 'medium') fee += 50;
  if (fragility === 'high') fee += 100;

  // county adjustment
  const nearby = ['Nairobi', 'Kiambu', 'Machakos'];

  if (nearby.includes(county)) fee += 70;
  else fee += 120;

  return fee;
};

module.exports = { calculateDelivery };