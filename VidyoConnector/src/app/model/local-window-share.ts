export class LocalWindowShare {
  private object: any;

  constructor(object: any) {
    this.object = object;
  }

  public getName() {
    if (this.object == null) {
      return 'None';
    }

    var shareName;
    if (this.object.applicationName) {
      shareName = this.object.applicationName + ' : ' + this.object.name;
    } else {
      shareName = this.object.name;
    }
    return shareName;
  }

  public getObject() {
    return this.object;
  }
}
