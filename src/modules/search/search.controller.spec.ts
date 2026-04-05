import { SearchController } from './search.controller';

describe('SearchController classify flow', () => {
  const makeController = () => {
    const searchService = {
      classifyQueryOnly: jest.fn(),
    } as any;

    const cloudinaryService = {} as any;
    const ipLimitService = {} as any;

    const controller = new SearchController(searchService, cloudinaryService, ipLimitService);
    return { controller, searchService };
  };

  it('orders missing fields by category and returns the correct first question', async () => {
    const { controller, searchService } = makeController();

    searchService.classifyQueryOnly.mockResolvedValue({
      classification: {
        category: 'car',
        confidence: 0.9,
        normalized_query: 'honda civic',
        missing_fields: ['price_range', 'condition', 'location'],
        suggested_question: null,
      },
      needsQuestion: true,
      missingFields: ['price_range', 'condition', 'location'],
    });

    const result = await controller.classifyQuery({ query: 'honda civic' }, { id: 'u1' });

    expect(result.missingFields).toEqual(['condition', 'location', 'price_range']);
    expect(result.question).toBe('Você prefere novo ou usado?');
    expect(result.needsQuestion).toBe(true);
  });

  it('does not reclassify when prevClassification + answers are provided and handles "todo o brasil"', async () => {
    const { controller, searchService } = makeController();

    const result = await controller.classifyQuery(
      {
        query: 'honda civic',
        answers: { location: 'todo o brasil' },
        prevClassification: {
          category: 'car',
          normalized_query: 'honda civic',
          missing_fields: ['location', 'condition'],
          condition: 'unknown',
        },
      },
      { id: 'u1' },
    );

    expect(searchService.classifyQueryOnly).not.toHaveBeenCalled();
    expect(result.classification.user_location).toBeNull();
    expect(result.missingFields).toEqual(['condition']);
    expect(result.question).toBe('Você prefere novo ou usado?');
  });

  it('parses city-state formats from location answers', async () => {
    const { controller } = makeController();

    const result = await controller.classifyQuery(
      {
        query: 'corolla',
        answers: { location: 'Campinas-SP' },
        prevClassification: {
          category: 'car',
          normalized_query: 'corolla',
          missing_fields: ['location'],
        },
      },
      { id: 'u1' },
    );

    expect(result.classification.user_location).toEqual({ city: 'Campinas', state: 'SP' });
    expect(result.missingFields).toBeUndefined();
    expect(result.needsQuestion).toBeUndefined();
  });

  it('asks only fields compatible with selected scrapers', async () => {
    const { controller, searchService } = makeController();

    searchService.classifyQueryOnly.mockResolvedValue({
      classification: {
        category: 'general',
        confidence: 0.91,
        normalized_query: 'geladeira inox',
        scrapers: [{ name: 'mercadolivre', score: 1.0 }],
        missing_fields: ['prefer_proximity_olx', 'prefer_installments', 'require_free_shipping'],
        suggested_question: null,
      },
      needsQuestion: true,
      missingFields: ['prefer_proximity_olx', 'prefer_installments', 'require_free_shipping'],
    });

    const result = await controller.classifyQuery({ query: 'geladeira inox' }, { id: 'u1' });

    expect(result.missingFields).toEqual(['prefer_installments', 'require_free_shipping']);
    expect(result.missingFields).not.toContain('prefer_proximity_olx');
    expect(result.needsQuestion).toBe(true);
  });
});
