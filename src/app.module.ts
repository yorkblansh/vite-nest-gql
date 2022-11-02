import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import {} from 'apollo-server-express'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
// import { DonationsResolver } from './donations/donations.resolver'
import { DonationsModule } from './donations/donations.module'
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground'

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			// plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
			playground: true,
			typePaths: ['./**/*.graphql'],
			subscriptions: {
				'graphql-ws': true,
				'subscriptions-transport-ws': true
			}
		}),
		DonationsModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
