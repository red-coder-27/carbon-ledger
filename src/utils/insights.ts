import { Activity, Recommendation, ActivityCategory, TransportDetails, EnergyDetails, FoodDetails, WasteDetails } from '../types';
import { EMISSION_FACTORS } from '../data/emissionFactors';

interface InsightsResult {
  readonly highestCategory: ActivityCategory | 'none';
  readonly recommendations: readonly Recommendation[];
  readonly categoryTotals: Record<ActivityCategory, number>;
}

/**
 * Generates recommendations based on the user's logged activities in the last 7 days.
 * If no activities exist, it returns a set of default starter recommendations.
 * @param {Activity[]} activities - The full array of user activities
 * @returns {InsightsResult} The generated insights and tailored recommendations
 * @example
 * generateInsights([]) // returns default starter recommendations
 */
export function generateInsights(activities: Activity[]): InsightsResult {
  const categoryTotals = {
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0
  };

  // If there are no activities, return default starter tips
  if (activities.length === 0) {
    return {
      highestCategory: 'none',
      categoryTotals,
      recommendations: getDefaultRecommendations()
    };
  }

  // Find the date of the latest activity to set as our time anchor
  const dates = activities.map(a => new Date(a.date).getTime());
  const latestTimestamp = Math.max(...dates);
  const oneWeekAgo = latestTimestamp - 7 * 24 * 60 * 60 * 1000;

  // Filter activities to the last 7 days of active logs
  const recentActivities = activities.filter(a => new Date(a.date).getTime() >= oneWeekAgo);

  // Aggregate emissions for these 7 days
  recentActivities.forEach(act => {
    categoryTotals[act.category] += act.emissions;
  });

  // Determine highest impact category
  let highestCategory: ActivityCategory = 'transport';
  let maxEmissions = -1;
  (Object.keys(categoryTotals) as ActivityCategory[]).forEach(cat => {
    if (categoryTotals[cat] > maxEmissions) {
      maxEmissions = categoryTotals[cat];
      highestCategory = cat;
    }
  });

  // Generate recommendation list
  const recommendations: Recommendation[] = [];

  // --- TRANSPORT RULES ---
  const transportActivities = recentActivities.filter(a => a.category === 'transport');
  let petrolDistance = 0;
  let dieselDistance = 0;
  let evDistance = 0;
  let twoWheelerDistance = 0;
  let flightDomesticDistance = 0;
  let flightIntlDistance = 0;
  let shortTripsCount = 0; // trips <= 5km by fossil fuel

  transportActivities.forEach(a => {
    const d = a.details as TransportDetails;
    if (!d) return;
    if (d.mode === 'car-petrol') petrolDistance += d.distance;
    if (d.mode === 'car-diesel') dieselDistance += d.distance;
    if (d.mode === 'car-ev') evDistance += d.distance;
    if (d.mode === 'two-wheeler') twoWheelerDistance += d.distance;
    if (d.mode === 'flight-domestic') flightDomesticDistance += d.distance;
    if (d.mode === 'flight-international') flightIntlDistance += d.distance;
    if (['car-petrol', 'car-diesel', 'two-wheeler'].includes(d.mode) && d.distance <= 5) {
      shortTripsCount += 1;
    }
  });

  if (petrolDistance > 30) {
    const savings = petrolDistance * 0.4 * (EMISSION_FACTORS.transport['car-petrol'] - EMISSION_FACTORS.transport['train-metro']);
    recommendations.push({
      id: 't_petrol_transit',
      category: 'transport',
      title: 'Swap Petrol Commutes for Metro/Train',
      description: `You logged ${petrolDistance.toFixed(0)} km on petrol cars. Swapping 40% of this distance for public transit can heavily reduce your emissions.`,
      savings: Number(savings.toFixed(1)),
      actionableText: 'Take the metro or local train for your next long commute.'
    });
  }

  if (dieselDistance > 30) {
    const savings = dieselDistance * 0.3 * (EMISSION_FACTORS.transport['car-diesel'] - EMISSION_FACTORS.transport['bus']);
    recommendations.push({
      id: 't_diesel_bus',
      category: 'transport',
      title: 'Take the Bus Instead of Diesel Car',
      description: `You logged ${dieselDistance.toFixed(0)} km in a diesel car. Substituting 30% of these trips with bus transits yields immediate savings.`,
      savings: Number(savings.toFixed(1)),
      actionableText: 'Identify bus routes connecting your frequent destinations.'
    });
  }

  if (flightDomesticDistance > 0) {
    const savings = flightDomesticDistance * 0.255; // Saving one full trip length
    recommendations.push({
      id: 't_flight_reduction',
      category: 'transport',
      title: 'Opt for Virtual Meetings or Train Travel',
      description: 'Air travel has a high warming impact. Swapping one domestic flight for a train journey or a virtual call saves substantial carbon.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Suggest a Zoom meeting instead of traveling, or book a sleeper train.'
    });
  }

  if (shortTripsCount >= 2) {
    const savings = shortTripsCount * 3 * EMISSION_FACTORS.transport['car-petrol']; // assume 3km avg
    recommendations.push({
      id: 't_active_travel',
      category: 'transport',
      title: 'Walk or Cycle for Short Errands',
      description: `You logged ${shortTripsCount} short vehicular trips under 5 km. Short trips run cold engines, which emit more per km.`,
      savings: Number(savings.toFixed(1)),
      actionableText: 'Walk or ride a bicycle for trips under 3 kilometers.'
    });
  }

  if (twoWheelerDistance > 40) {
    const savings = twoWheelerDistance * 0.25 * EMISSION_FACTORS.transport['two-wheeler'];
    recommendations.push({
      id: 't_twowheeler_carpool',
      category: 'transport',
      title: 'Ride-Share or Consolidate Bike Errands',
      description: `You rode ${twoWheelerDistance.toFixed(0)} km on a two-wheeler. Consolidating 25% of these trips reduces fuel burn.`,
      savings: Number(savings.toFixed(1)),
      actionableText: 'Coordinate errands with family or carpool with a colleague.'
    });
  }

  if (evDistance > 50) {
    const savings = evDistance * 0.085 * 0.15; // 15% clean offset
    recommendations.push({
      id: 't_ev_solar_charge',
      category: 'transport',
      title: 'Charge EV during Peak Solar Hours',
      description: 'Your EV is only as clean as the grid. Charging between 10 AM and 3 PM leverages active solar generation on the Indian grid.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Set your EV charger timer to charge during daylight hours.'
    });
  }


  // --- ENERGY RULES ---
  const energyActivities = recentActivities.filter(a => a.category === 'energy');
  let totalElectricity = 0;
  let totalLpg = 0;

  energyActivities.forEach(a => {
    const d = a.details as EnergyDetails;
    if (!d) return;
    totalElectricity += d.electricity || 0;
    totalLpg += d.lpg || 0;
  });

  if (totalElectricity > 40) {
    const savings = totalElectricity * 0.08 * EMISSION_FACTORS.energy.electricity; // 8% saving
    recommendations.push({
      id: 'e_ac_temperature',
      category: 'energy',
      title: 'Raise Air Conditioner Temp to 24°C',
      description: `Based on your ${totalElectricity.toFixed(0)} kWh electricity usage, raising your AC thermostat from 20°C to 24°C saves around 8% of energy.`,
      savings: Number(savings.toFixed(1)),
      actionableText: 'Set your AC default temperature to 24°C and use a ceiling fan to circulate air.'
    });
  }

  if (totalElectricity > 15) {
    const savings = 2.5 * EMISSION_FACTORS.energy.electricity; // saving ~2.5 kWh/week
    recommendations.push({
      id: 'e_vampire_load',
      category: 'energy',
      title: 'Unplug Idle Appliances (Standby Power)',
      description: 'Devices on standby (TVs, chargers, microwave displays) consume "vampire loads" which account for up to 10% of household electricity.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Turn off power strips and wall switches when electronics are not in use.'
    });
  }

  if (totalLpg > 0) {
    const savings = totalLpg * EMISSION_FACTORS.energy.lpg * 0.12; // 12% cooking efficiency saving
    recommendations.push({
      id: 'e_efficient_cooking',
      category: 'energy',
      title: 'Implement Efficient Cooking Practices',
      description: 'Using pressure cookers, cooking with lids on, and pre-soaking grains saves significant LPG cylinder consumption.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Keep pots covered and reduce flame once boiling points are reached.'
    });
  }

  if (totalElectricity > 25) {
    const savings = 5.0 * EMISSION_FACTORS.energy.electricity; // assume 5 kWh saved
    recommendations.push({
      id: 'e_led_transition',
      category: 'energy',
      title: 'Switch to energy-efficient LED bulbs',
      description: 'Replacing older compact fluorescent or incandescent lamps with star-rated LEDs drops lighting energy by up to 80%.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Replace your most-used home light fixture with a 9W LED bulb.'
    });
  }


  // --- FOOD RULES ---
  const foodActivities = recentActivities.filter(a => a.category === 'food');
  let nonVegHeavyDays = 0;
  let nonVegModDays = 0;
  let eggetarianDays = 0;
  let vegetarianDays = 0;

  foodActivities.forEach(a => {
    const d = a.details as FoodDetails;
    if (!d) return;
    if (d.dietType === 'non-veg-heavy') nonVegHeavyDays += 1;
    if (d.dietType === 'non-veg-moderate') nonVegModDays += 1;
    if (d.dietType === 'eggetarian') eggetarianDays += 1;
    if (d.dietType === 'vegetarian') vegetarianDays += 1;
  });

  if (nonVegHeavyDays >= 2) {
    const savings = 2 * (EMISSION_FACTORS.diet['non-veg-heavy'] - EMISSION_FACTORS.diet['vegetarian']);
    recommendations.push({
      id: 'f_heavy_to_veg',
      category: 'food',
      title: 'Substitute 2 High-Meat Days with Vegetarian',
      description: 'Red meat and heavy non-vegetarian diets carry high methane and land-use footprints. Swapping 2 days for veg meals makes a huge dent.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Cook delicious dal, paneer, or lentil-based dishes for two days this week.'
    });
  }

  if (nonVegModDays >= 3) {
    const savings = 2 * (EMISSION_FACTORS.diet['non-veg-moderate'] - EMISSION_FACTORS.diet['vegetarian']);
    recommendations.push({
      id: 'f_meat_free_mondays',
      category: 'food',
      title: 'Observe Two Meat-Free Days Weekly',
      description: 'Reducing moderate meat consumption by just two days a week saves considerable water and CO2 equivalent emissions.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Designate Monday and Thursday as vegetarian or vegan days.'
    });
  }

  if (eggetarianDays >= 3) {
    const savings = 2 * (EMISSION_FACTORS.diet['eggetarian'] - EMISSION_FACTORS.diet['vegan']);
    recommendations.push({
      id: 'f_egg_to_vegan',
      category: 'food',
      title: 'Swap Eggs for Plant Proteins 2x/Week',
      description: 'Poultry and egg production emit more carbon than plant alternatives. Swapping eggs for tofu, chickpeas, or sprouts saves carbon.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Have a chickpea scramble or plant-based breakfast twice this week.'
    });
  }

  if (vegetarianDays >= 3) {
    const savings = 3 * 0.4; // 0.4 kg saved per dairy substitute
    recommendations.push({
      id: 'f_dairy_substitute',
      category: 'food',
      title: 'Explore Plant-Based Milks',
      description: 'Dairy farming is a major source of agricultural methane. Swapping dairy milk for oat, soy, or almond milk reduces your food footprint.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Try soy or oat milk in your morning tea or coffee.'
    });
  }


  // --- WASTE RULES ---
  const wasteActivities = recentActivities.filter(a => a.category === 'waste');
  let mixedWasteDays = 0;
  let highWasteDays = 0;
  let mediumWasteDays = 0;
  let segregatedWasteDays = 0;

  wasteActivities.forEach(a => {
    const d = a.details as WasteDetails;
    if (!d) return;
    if (d.segregated === false) mixedWasteDays += 1;
    if (d.segregated === true) segregatedWasteDays += 1;
    if (d.level === 'high') highWasteDays += 1;
    if (d.level === 'medium') mediumWasteDays += 1;
  });

  if (mixedWasteDays >= 2) {
    // Difference between mixed and segregated waste is roughly 0.4 - 0.8 depending on level
    const savings = mixedWasteDays * 0.6; 
    recommendations.push({
      id: 'w_segregation',
      category: 'waste',
      title: 'Segregate Wet & Dry Waste at Source',
      description: `You logged ${mixedWasteDays} days with unsegregated waste. Mixed waste goes to landfills and generates methane; segregated waste can be recycled.`,
      savings: Number(savings.toFixed(1)),
      actionableText: 'Set up separate color-coded bins for organic/wet waste and dry recyclables.'
    });
  }

  if (highWasteDays >= 2) {
    const savings = highWasteDays * 0.8;
    recommendations.push({
      id: 'w_reduce_volume',
      category: 'waste',
      title: 'Reduce Waste through Meal Planning',
      description:highWasteDays.toString() + ' high volume waste days logged. Planning meals and storage helps cut organic waste volume.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Audit your fridge before shopping and write a strict list to prevent over-buying.'
    });
  }

  if (mediumWasteDays >= 3) {
    const savings = 1.8; // constant weekly estimate
    recommendations.push({
      id: 'w_reusables',
      category: 'waste',
      title: 'Reject Single-Use Plastics',
      description: 'Plastic packaging is carbon intensive to make and transport. Opting for reusable grocery bags and containers decreases daily waste.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Keep a folded cloth bag in your vehicle or backpack for impromptu shopping.'
    });
  }

  if (segregatedWasteDays >= 3) {
    const savings = segregatedWasteDays * 0.4;
    recommendations.push({
      id: 'w_home_compost',
      category: 'waste',
      title: 'Compost Wet Organic Waste at Home',
      description: 'Composting kitchen food waste at home prevents it from emitting methane in local municipal waste dumps.',
      savings: Number(savings.toFixed(1)),
      actionableText: 'Start a small compost bin on your balcony or garden for vegetable peels and coffee grounds.'
    });
  }

  // Filter recommendations to prioritize the highest-impact category's suggestions,
  // but ensure a total of 3-5 suggestions, ranked by savings descending.
  
  // Sort all generated recommendations by savings descending
  let finalRecommendations = recommendations.sort((a, b) => b.savings - a.savings);

  // Group by category to pull the highest-impact category first
  const highestCategoryRecs = finalRecommendations.filter(r => r.category === highestCategory);
  const otherRecs = finalRecommendations.filter(r => r.category !== highestCategory);

  // Combine them, putting highest category's recommendations at the top
  const orderedRecs = [...highestCategoryRecs, ...otherRecs];

  // Slice to get 3-5 recommendations (we'll show top 4 if available)
  let slicedRecs = orderedRecs.slice(0, 4);

  // If we ended up with less than 3 recommendations, add some general ones from the highest category or default set
  if (slicedRecs.length < 3) {
    const defaultRecs = getDefaultRecommendations();
    const tempRecs = [...slicedRecs];
    for (const r of defaultRecs) {
      if (tempRecs.length >= 3) break;
      if (!tempRecs.some(fr => fr.id === r.id)) {
        tempRecs.push(r);
      }
    }
    slicedRecs = tempRecs;
  }

  return {
    highestCategory,
    categoryTotals,
    recommendations: slicedRecs
  };
}

/**
 * Returns default educational recommendations when no data has been logged.
 * @returns {Recommendation[]} Standard set of default starter recommendations
 * @example
 * getDefaultRecommendations() // returns [ { id: 'def_transit', ... }, ... ]
 */
export function getDefaultRecommendations(): Recommendation[] {
  return [
    {
      id: 'def_transit',
      category: 'transport',
      title: 'Swap Commutes for Public Transit',
      description: 'Taking public transit like metro systems or buses cut emissions by over 60-80% compared to solo driving in petrol cars.',
      savings: 8.5,
      actionableText: 'Substitute two driving trips this week with public transport.'
    },
    {
      id: 'def_energy',
      category: 'energy',
      title: 'Turn up AC to 24°C & Use Fans',
      description: 'Air conditioners are major electricity draws. Keeping them at 24 degrees Celsius instead of 20 reduces load on India\'s coal-heavy grid.',
      savings: 5.2,
      actionableText: 'Adjust your home and office AC thermostat to 24°C.'
    },
    {
      id: 'def_diet',
      category: 'food',
      title: 'Incorporate More Plant-Based Days',
      description: 'Animal farming has high emissions. Enjoying dairy-free and vegetarian diets even a few times a week reduces your food footprint.',
      savings: 4.8,
      actionableText: 'Observe a complete plant-based (vegan) diet for one day.'
    },
    {
      id: 'def_waste',
      category: 'waste',
      title: 'Segregate Wet and Dry Trash',
      description: 'Segregated waste gets recycled or composted properly, preventing anaerobic decay in landfills which emits potent methane gases.',
      savings: 3.0,
      actionableText: 'Label two bins at home: one for wet food scraps, one for dry plastic/paper.'
    }
  ];
}
