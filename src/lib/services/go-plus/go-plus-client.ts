export class GoPlusClient {
  private baseUrl: string = 'https://api.gopluslabs.io/api/v1/'
  
  getAddressSecurityInfo(address: string): Promise<any> {
    return this.get(`address/${address}/security`)
  }
}
