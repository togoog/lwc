import { Element } from 'engine'

export default class BoundaryChildSlotThrow extends Element {
    @track state = {}

    errorCallback(error) {
        this.state.error = error;
    }
}