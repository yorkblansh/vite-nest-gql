import { Injectable } from '@nestjs/common'
import { CreateDonationInput } from './dto/create-donation.input'
import { UpdateDonationInput } from './dto/update-donation.input'

@Injectable()
export class DonationsService {
	create(createDonationInput: CreateDonationInput) {
		return 'This action adds a new donation'
	}

	findAll() {
		return [
			{
				count: 1
			}
		]
		// return `This action returns all donations`;
	}

	findOne(id: number) {
		return `This action returns a #${id} donation`
	}

	update(id: number, updateDonationInput: UpdateDonationInput) {
		return `This action updates a #${id} donation`
	}

	remove(id: number) {
		return `This action removes a #${id} donation`
	}
}
