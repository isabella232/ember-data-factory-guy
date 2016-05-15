import Ember from 'ember';
import JSONFixtureConverter from './json-fixture-converter';
const { pluralize, dasherize } = Ember.String;

/**
 Convert base fixture to a REST format fixture.

 @param store
 @constructor
 */
export default class extends JSONFixtureConverter {

  constructor(store) {
    super(store);
    this.included = {};
  }
  /**
   * RESTSerializer has a paylaod key
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(modelName, fixture) {
    return { [this.getPayloadKey(modelName)]: fixture };
  }
  /**
   * Get the payload key for this model from the serializer
   *
   * @param modelName
   * @returns {*}
   */
  getPayloadKey(modelName) {
    let serializer = this.store.serializerFor(modelName);
    let payloadKey = serializer.payloadKeyFromModelName(modelName);
    return (this.listType) ? pluralize(payloadKey) : payloadKey;
  }
  /**
   * Add the included data
   *
   * @param payload
   */
  addIncludedArray(payload) {
    Object.keys(this.included).forEach((key)=> {
      payload[key] = this.included[key];
    });
  }
  /**
   Add the model to included array unless it's already there.

   @param {String} modelKey
   @param {Object} data
   @param {Object} includeObject
   */
  addToIncluded(data, modelKey) {
    let relationshipKey = pluralize(dasherize(modelKey));

    if (!this.included[relationshipKey]) {
      this.included[relationshipKey] = [];
    }

    let modelRelationships = this.included[relationshipKey];

    let found = Ember.A(modelRelationships).find((existing)=> {
      return existing.id === data.id;
    });

    if (!found) {
      modelRelationships.push(data);
    }
  }
  /**
    Add proxied json to this payload, by taking all included models and
    adding them to this payloads includes

    @param proxy json payload proxy
   */
  addToIncludedFromProxy(proxy) {
    proxy.includeKeys().forEach((modelKey)=> {
      let includedModels = proxy.getInclude(modelKey);
      includedModels.forEach((data)=> {
        this.addToIncluded(data, modelKey);
      });
    });
  }

}
