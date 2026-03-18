import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotAuthGuard } from './chatbot.guard';
import { ChatbotService } from './chatbot.service';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly chatbotService: ChatbotService) { }

    @Get('data')
    @UseGuards(ChatbotAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Fetch all synchronized data for the chatbot context',
        description: 'Returns all active products, brands, categories, and public PC builds. **Note:** Filtering and searching should be done on the client/bot side using this payload.'
    })
    @ApiResponse({
        status: 200,
        description: 'Successful data retrieval',
        schema: {
            type: 'object',
            properties: {
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            price: { type: 'number' },
                            brand: { type: 'string' },
                            category: { type: 'string' },
                            stock: { type: 'number' },
                            specifications: { type: 'object' },
                        }
                    }
                },
                brands: { type: 'array', items: { type: 'object' } },
                categories: { type: 'array', items: { type: 'object' } },
                publicBuilds: { type: 'array', items: { type: 'object' } },
                meta: {
                    type: 'object',
                    properties: {
                        totalProducts: { type: 'number' },
                        totalBrands: { type: 'number' },
                        totalCategories: { type: 'number' },
                        totalPublicBuilds: { type: 'number' }
                    }
                }
            }
        }
    })
    async getData() {
        return this.chatbotService.getData();
    }
}
