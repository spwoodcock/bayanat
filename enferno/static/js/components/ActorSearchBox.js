Vue.component('actor-search-box', {
    props: {
        value: {
            type: Object,
            required: true
        },
        users: {
            type: Array
        },
        closeBtn: {
            type: String
        },
        extraFilters: {
            type: Boolean
        }
        ,
        showOp: {
            type: Boolean,
            default: true
        },
        i18n: {
            type: Object,

        },

         roles: {
            type: Array
        },
         isAdmin : {
        type: Boolean,
        default: false
        }
    },

    data: () => {
        return {
            searches: [],
            repr: '',
            q: {},
            qName: '',



        }
    },
    watch: {


        q: {
            handler(newVal) {

                this.$emit('input', newVal)
            }
            ,
            deep: true
        },
        value: function (newVal, oldVal) {


            if (newVal != oldVal) {
                this.q = newVal;
            }
        }

    },
    created() {
        this.q = this.value;

    },
    methods: {},

    template: `
      <v-card outlined class="pa-7">

      <v-btn v-if="closeBtn" absolute top right @click="$emit('close')" icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>


      <v-container class="fluid">
        <v-row v-if="showOp">
          <v-col>
            <v-btn-toggle mandatory v-model="q.op">
              <v-btn small value="and">And</v-btn>
              <v-btn small value="or">Or</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
        <v-row>
          <v-col>

            <v-text-field

                v-model="q.tsv"
                :label="i18n.contains_"
                clearable
                @keydown.enter="$emit('search',q)"
            ></v-text-field>

            <v-text-field

                v-model="q.extsv"
                :label="i18n.notContains_"
                clearable
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>


          <v-col>

            <div class="d-flex">
              <pop-date-field :label="i18n.publishDate_" v-model="q.pubdate"></pop-date-field>
              <v-select

                  dense

                  v-model="q.pubdatewithin"
                  :label="i18n.within_"
                  :items="dateWithin"
                  class="mx-2"

              ></v-select>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <div class="d-flex">
              <pop-date-field :label="i18n.documentationDate_" v-model="q.docdate"></pop-date-field>
              <v-select
                  class="mx-2"
                  dense

                  v-model="q.docdatewithin"
                  :label="i18n.within_"
                  :items="dateWithin"

              ></v-select>
            </div>
          </v-col>

        </v-row>

        <v-row>
          <v-col>
            <div class="d-flex">
              <pop-date-field :label="i18n.eventDate_" v-model="q.edate"></pop-date-field>
              <v-select
                  dense
                  v-model="q.edatewithin"
                  :label="i18n.within_"
                  :items="dateWithin"
                  class="mx-2"
              ></v-select>
            </div>
          </v-col>
        </v-row>
        
           <v-row v-if="isAdmin" > 
                    <v-col md="9">
                        <span class="caption">Access Roles</span>
                        <v-chip-group
                                column
                                multiple
                                v-model="q.roles"                                
                        >
                            <v-chip v-if="roles" :value="role.id" small v-for="role in roles" filter
                                    outlined>{{role.name}}</v-chip>
                        </v-chip-group>
                    </v-col>
                    <v-col md="3">
                        <span class="caption">Unrestricted</span>
                        <v-switch v-model="q.norole"></v-switch>
                    </v-col>
            </v-row>


        <v-row v-if="extraFilters">
          <v-col>
            <span class="caption">{{ i18n.assignedUser_ }}</span>


            <v-chip-group
                column
                multiple
                v-model="q.assigned"
            >
              <v-chip :value="user.id" small label v-for="user in users" filter
                      outlined>{{ user.name }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>

        <v-row v-if="extraFilters">
          <v-col cols="12">
            <span class="caption">{{ i18n.reviewer_ }}</span>

            <v-chip-group
                column
                multiple
                v-model="q.reviewer"
            >
              <v-chip :value="user.id" label small v-for="user in users" filter
                      outlined>{{ user.name }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>


        <v-row v-if="extraFilters">
          <v-col cols="12">
            <span class="caption pt-2">{{ i18n.workflowStatus_ }}</span>


            <v-chip-group
                column
                v-model="q.status"
            >
              <v-chip :value="status.en" label small v-for="status in translations.statuses_" :key="status.en" filter
                      outlined>{{ status.tr }}
              </v-chip>
            </v-chip-group>

          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <span class="caption pt-2">{{ i18n.reviewAction_ }}</span>
            <v-chip-group column v-model="q.reviewAction">
              <v-chip value="No Review Needed" label small filter outlined>No Review Needed</v-chip>
              <v-chip value="Needs Review" label small filter outlined>Needs Review</v-chip>

            </v-chip-group>

          </v-col>
        </v-row>
        <v-row>

          <v-col>
            <div class="d-flex">

              <search-field

                  v-model="q.sources"
                  api="/admin/api/sources/"
                  item-text="title"
                  item-value="id"
                  :multiple="true"
                  :label="i18n.includeSources_"
              ></search-field>
              <v-checkbox :label="i18n.any_" dense v-model="q.opsources" color="primary" small
                          class="mx-3"></v-checkbox>

            </div>

            <search-field
                v-model="q.exsources"
                api="/admin/api/sources/"
                item-text="title"
                item-value="id"
                :multiple="true"
                :label="i18n.excludeSources_"

            ></search-field>


          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <div class="d-flex">
              <search-field
                  v-model="q.labels"
                  api="/admin/api/labels/"
                  query-params="&typ=for_actor&mode=2"
                  item-text="title"
                  item-value="id"
                  :multiple="true"
                  :label="i18n.includeLabels_"
              ></search-field>
              <v-checkbox :label="i18n.any_" dense v-model="q.oplabels" color="primary" small
                          class="mx-3"></v-checkbox>
            </div>

            <search-field
                v-model="q.exlabels"
                api="/admin/api/labels/"
                query-params="&typ=for_actor"
                item-text="title"
                item-value="id"
                :multiple="true"
                :label="i18n.excludeLabels_"
            ></search-field>


          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex">
              <search-field
                  v-model="q.vlabels"
                  api="/admin/api/labels/"
                  query-params="&fltr=verified&typ=for_actor"
                  item-text="title"
                  item-value="id"
                  :multiple="true"
                  :label="i18n.includeVerLabels_"
              ></search-field>
              <v-checkbox :label="i18n.any_" dense v-model="q.opvlabels" color="primary" small
                          class="mx-3"></v-checkbox>
            </div>

            <search-field
                v-model="q.exvlabels"
                api="/admin/api/labels/"
                query-params="&fltr=verified&typ=for_actor"
                item-text="title"
                item-value="id"
                :multiple="true"
                :label="i18n.excludeVerLabels_"
            ></search-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>

            <search-field
                v-model="q.resLocations"
                api="/admin/api/locations/"
                item-text="full_string"
                item-value="id"
                :multiple="true"
                :label="i18n.includeResLocations_"
            ></search-field>


            <search-field
                v-model="q.exResLocations"
                api="/admin/api/locations/"
                item-text="full_string"
                item-value="id"
                :multiple="true"
                :label="i18n.excludeResLocations_"
            ></search-field>


          </v-col>
        </v-row>

        <v-row>
          <v-col>

            <search-field
                v-model="q.originLocations"
                api="/admin/api/locations/"
                item-text="full_string"
                item-value="id"
                :multiple="true"
                :label="i18n.includeOriginLocations_"
            ></search-field>


            <search-field
                v-model="q.exOriginLocations"
                api="/admin/api/locations/"
                item-text="full_string"
                item-value="id"
                :multiple="true"
                :label="i18n.excludeOriginLocations_"
            ></search-field>


          </v-col>
        </v-row>


        <v-row>
          <v-col>
            <search-field
                v-model="q.elocation"
                api="/admin/api/locations/"
                item-text="full_string"
                item-value="id"
                :multiple="false"
                :label="i18n.includeEventLocations_"
            ></search-field>

          </v-col>

        </v-row>


        <v-row>
          <v-col cols="12" md="12">
            <search-field
                v-model="q.etype"
                api="/admin/api/eventtypes/"
                query-params="&typ=for_actor"
                item-text="title"
                item-value="id"
                :multiple="false"
                :label="i18n.eventType_"
            ></search-field>

          </v-col>

        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
                :label="i18n.occupation_"
                v-model="q.occupation"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
                :label="i18n.position_"
                v-model="q.position"
            >
            </v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
                :label="i18n.spokenDialects_"
                v-model="q.dialects"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
                :label="i18n.familyStatus_"
                v-model="q.family_status"
            >
            </v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="3">
            <v-select
                :items="translations.actorSex"
                item-text="tr"
                item-value="en"
                v-model="q.sex"
                :label="i18n.sex_"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
                :items="translations.actorAge"
                item-text="tr"
                item-value="en"
                v-model="q.age"
                :label="i18n.minorAdult_"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
                :items="translations.actorCivilian"
                item-text="tr"
                item-value="en"
                v-model="q.civilian"
                :label="i18n.civilian_"
            ></v-select>
          </v-col>

          <v-col md="3">
            <v-select
                item-text="tr"
                item-value="en"
                :items="translations.actorTypes"
                v-model="q.actor_type"
                :label="i18n.actorType_"
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
                :items="translations.actorEthno"
                item-text="tr"
                item-value="en"
                v-model="q.ethnography"
                :label="i18n.ethnography_"
            ></v-autocomplete>

          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
                :items="translations.countries"
                item-text="tr"
                item-value="en"
                v-model="q.nationality"
                :label="i18n.nationality_"
            ></v-autocomplete>

          </v-col>
        </v-row>
        <v-row>
          <v-col md="12">
            <search-field
                v-model="q.birth_place"
                api="/admin/api/locations/"
                item-text="full_string"
                item-value="id"
                :multiple="false"
                :label="i18n.birthPlace_"
            ></search-field>


          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
                item-text="tr"
                item-value="en"
                :items="translations.conditionTypes"
                v-model="q.condition"
                :label="i18n.condition_"
            ></v-select>
          </v-col>
          <v-col md="6">
            <v-text-field dense :label="i18n.nationalIdCard_" v-model="q.national_id_card"></v-text-field>

          </v-col>
        </v-row>


      </v-container>


      </v-card>

    `

})