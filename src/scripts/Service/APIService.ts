import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject, createHttpLink, gql } from "@apollo/client/core";
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';


export class APIService {

    private static _instance: APIService;

    private static getInstance() {
        if (!APIService._instance) {
            APIService._instance = new APIService();
        }
        return APIService._instance;
    }

    static get instance(): APIService {
        return this.getInstance();
    }

    client: ApolloClient<NormalizedCacheObject>;
    token: string = ""
    apiKey: string = ""
    url: string = "https://virtual-pet-sit.pylonlab.tech/backend/graphql";

    constructor() {

        console.error("Test")

        const httpLink = new HttpLink({
            uri: `${this.url}`, fetch
        })

        const authLink = setContext(() => {
            const token = this.token;
            return {
                headers: {
                    authorization: 'Bearer '+ token,
                    'x-api-key': this.apiKey
                },
            };
        });

        // const authLink = setContext((_, { headers }) => {
        //     // get the authentication token from local storage if it exists
        //     const token = this.token //localStorage.getItem('token');
        //     // return the headers to the context so httpLink can read them
        //     return {
        //         headers: {
        //             ...headers,
        //             authorization: token ? `Bearer ${token}` : "",
        //             'x-api-key' : this.apiKey,
        //         }
        //     }
        // });

        this.client = new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache()
        });


        this.test();
    }

    private async test() {
        const query = gql`query AdminGetAllUser($pagination: PaginationRequireRequest!, $data: GetAllUserRequest) {
            adminGetAllUser(pagination: $pagination, data: $data) {
              total
            }
          }`;
        const variable = {
            "pagination": {
                "first": 1,
                "skip": 0
            }
        };


        await this.client.query({ query: query, variables: variable }).then((result) => console.log(result)).catch(error => console.error(error));
    }
}




