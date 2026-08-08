import { Listing, Phase } from './types';

export function buildProgressMessages(phase: Phase, statusText: string) {
  const stages: Phase[] = ['interview', 'researching', 'recommending', 'form', 'payment', 'done'];
  const activeIndex = stages.indexOf(phase);

  return [
    {
      version: 'v0.9.1',
      createSurface: {
        surfaceId: 'progress',
        catalogId: 'custom',
      },
    },
    {
      version: 'v0.9.1',
      updateComponents: {
        surfaceId: 'progress',
        components: [
          {
            id: 'progress-dial-root',
            component: 'GaugeDial',
            props: {
              currentStage: phase,
              stageIndex: activeIndex >= 0 ? activeIndex : 0,
              statusText: statusText || getStageDefaultText(phase),
              stages: [
                { id: 'interview', label: 'Interview' },
                { id: 'researching', label: 'Research' },
                { id: 'recommending', label: 'Recommend' },
                { id: 'form', label: 'Application' },
                { id: 'payment', label: 'Checkout' },
                { id: 'done', label: 'Confirmed' },
              ],
            },
          },
        ],
      },
    },
  ];
}

export function buildCatalogueMessages(
  recommendations: Array<{ listing: Listing; score: number; reasoning: string }>
) {
  const cards = recommendations.map((item) => {
    const car = item.listing;
    return {
      id: `car-card-${car.id}`,
      component: 'CarCard',
      props: {
        id: car.id,
        brand: car.brand,
        model: car.model,
        trim: car.trim,
        year: car.year,
        color: car.color,
        category: car.category,
        listingType: car.listingType,
        price: car.price,
        dailyRate: car.dailyRate,
        mileage: car.mileage,
        fuelType: car.fuelType,
        condition: car.condition,
        location: car.location,
        marketplace: car.marketplace,
        imageUrl: car.imageUrl,
        features: car.features,
        matchScore: item.score,
        reasoning: item.reasoning,
      },
    };
  });

  return [
    {
      version: 'v0.9.1',
      createSurface: {
        surfaceId: 'catalogue',
        catalogId: 'custom',
      },
    },
    {
      version: 'v0.9.1',
      updateComponents: {
        surfaceId: 'catalogue',
        components: cards,
      },
    },
    {
      version: 'v0.9.1',
      updateDataModel: {
        surfaceId: 'catalogue',
        data: {
          totalResults: recommendations.length,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  ];
}

function getStageDefaultText(phase: Phase): string {
  switch (phase) {
    case 'interview':
      return 'Gathering driving preferences...';
    case 'researching':
      return 'Searching mock marketplace (100+ listings)...';
    case 'recommending':
      return 'Ranking candidates and synthesizing reasoning...';
    case 'form':
      return 'Awaiting application details...';
    case 'payment':
      return 'Awaiting mock checkout confirmation...';
    case 'done':
      return 'Booking confirmed!';
    default:
      return '';
  }
}
