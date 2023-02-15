Vue.component("actor-card", {
    props: ["actor", "close", "thumb-click", "active", "log", "diff", "showEdit", "i18n"],
    watch: {
        actor: function (b, n) {


            if (!this.$root.currentUser.view_simple_history) {
                this.log = false;
            }
            if (this.$root.currentUser.view_full_history) {
                this.diff = true;
            }

              this.loadBulletinRelations();
            this.loadActorRelations();
            this.loadIncidentRelations();


        },
    },






    methods: {
          translate_status(status){
          return translate_status(status);
        },
          loadBulletinRelations(page=1) {

             // b2a
            axios.get(`/admin/api/actor/relations/${this.actor.id}?class=bulletin&page=${page}`).then(res=>{
            this.actor.bulletin_relations.push.apply(this.actor.bulletin_relations,res.data.items);
            this.bulletinPage += 1;
            this.bulletinLM = res.data.more;
            }).catch(err=>{
                console.log(err.toJSON());
            });

        },

        loadActorRelations(page = 1){


            axios.get(`/admin/api/actor/relations/${this.actor.id}?class=actor&page=${page}`).then(res=>{
            //console.log(this.bulletin.actor_relations, res.data.items);
            this.actor.actor_relations.push.apply(this.actor.actor_relations,res.data.items);
            this.actorPage +=1;
            this.actorLM = res.data.more;

            }).catch(err=>{
                console.log(err.toJSON());
            });



        },
        loadIncidentRelations(page =1){

             // b2i
            axios.get(`/admin/api/actor/relations/${this.actor.id}?class=incident&page=${page}`).then(res=>{
            this.actor.incident_relations.push.apply(this.actor.incident_relations, res.data.items);
            this.incidentPage +=1;
            this.incidentLM = res.data.more;
            }).catch(err=>{
                console.log(err.toJSON());
            });

        },


        probability(item) {
            return translations.probs[item.probability].tr;
        },
        actor_related_as(item) {
            if (this.actor.id < item.actor.id) {
                return translations.atoaRelateAs[item.related_as].tr.text;
            } else {
                return translations.atoaRelateAs[item.related_as].tr.revtext;
            }
        },
        bulletin_related_as(rid) {
            return translations.btoaRelateAs[rid].tr;

        },
        incident_related_as(item) {
            return translations.itoaRelateAs[item.related_as].tr;

        },


        editAllowed() {
            return this.$root.editAllowed(this.actor) && this.showEdit;
        },
        removeVideo() {
            let video = this.$el.querySelector("#iplayer video");
            if (video) {
                video.remove();
            }
        },
        viewThumb(s3url) {

            this.$emit("thumb-click", s3url);
        },

        viewVideo(s3url) {
            this.removeVideo();

            let video = document.createElement("video");
            video.src = s3url;
            video.controls = true;
            video.autoplay = true;
            this.$el.querySelector("#iplayer").append(video);
        },

        loadRevisions() {
            this.hloading = true;
            axios.get(`/admin/api/actorhistory/${this.actor.id}`).then((response) => {
                this.revisions = response.data.items;

            }).catch(error => {
                console.log(error.body.data)
            }).finally(() => {
                this.hloading = false;
            });

        },

        showDiff(e, index) {
            this.diffDialog = true;
            //calculate diff
            const dp = jsondiffpatch.create({
                arrays: {
                    detectMove: true,
                },
                objectHash: function (obj, index) {
                    return obj.name || obj.id || obj._id || "$$index:" + index;
                },
            });

            const delta = dp.diff(
                this.revisions[index + 1].data,
                this.revisions[index].data
            );
            if (!delta) {
                this.diffResult = "Both items are Identical :)";
            } else {
                this.diffResult = jsondiffpatch.formatters.html.format(delta);
            }
        },
    },

    data: function () {
        return {
            diffResult: "",
            diffDialog: false,
            revisions: null,
            show: false,
            hloading: false,

            related_as: ['Same Person', 'Duplicate', 'Parent', 'Child', 'Sibling', 'Spouse', 'Family member', 'Superior officer', 'Subordinate officer', 'Subunit', 'Alleged Perpetrator', 'Member', 'Group', 'Unit', 'Other'],

            // pagers for related entities
            bulletinPage: 1,
            actorPage: 1,
            incidentPage: 1,


             // load more buttons
            bulletinLM: false,
            actorLM: false,
            incidentLM:false
        };
    },

    template: `

  <v-card color="grey lighten-3" class="mx-auto pa-3">
        <v-card color="grey lighten-5" outlined class="header-fixed mx-2">
      <v-btn v-if="close" @click="$emit('close',$event.target.value)" fab absolute top right x-small text class="mt-6">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-card-text class="d-flex align-center">
        <v-chip small pill label color="gv darken-2" class="white--text">
          {{ i18n.id_ }} {{ actor.id }}</v-chip>

        <v-chip :href="actor.source_link" target="_blank" small pill label color="lime darken-3 "
                class="white--text ml-1">
          # {{ actor.originid }}</v-chip>
        <v-btn v-if="editAllowed()" class="ml-2" @click="$emit('edit',actor)" small outlined><v-icon color="primary" left>mdi-pencil</v-icon> {{ i18n.edit_ }}</v-btn>
        <v-btn @click.stop="$root.$refs.viz.visualize(actor)" class="ml-2" outlined small elevation="0"><v-icon color="primary" left>mdi-graph-outline</v-icon> {{ i18n.visualize_ }}</v-btn>
      </v-card-text>
      
      <v-chip color="blue-grey lighten-5" label small class="pa-2 mx-2 my-2" v-if="actor.assigned_to" ><v-icon left>mdi-account-circle-outline</v-icon>
          {{ i18n.assignedUser_ }} {{actor.assigned_to['name']}}</v-chip>
        <v-chip color="blue-grey lighten-5" small label class="mx-2 my-2" v-if="actor.status" > <v-icon left>mdi-delta</v-icon> {{translate_status(actor.status)}}</v-chip>
      </v-card>
        
        <v-card v-if="actor.roles?.length" color="blue darken-1" class="ma-2 pa-2 d-flex align-center flex-grow-1" elevation="0">
        <v-icon content="Access Roles" v-tippy color="white">mdi-lock</v-icon>
        <v-chip label color="gray darken-3" small v-for="role in actor.roles"  :color="role.color" class="caption mx-1">{{ role.name }}</v-chip>
          
        </v-card>

      <v-card outlined class="ma-2" color="grey lighten-5">
      <v-card-text>
        <h2 class="title black--text d-block">{{ actor.name }} ({{ actor.sex }})</h2>

        <div class="actor-description" v-html="actor.description"></div>
      </v-card-text>
    </v-card>
      

      <uni-field :caption="i18n.fullName_" :english="actor.name" :arabic="actor.name_ar"></uni-field>
      <uni-field :caption="i18n.nickName_" :english="actor.nickname" :arabic="actor.nickname_ar"></uni-field>
      <div class="d-flex">
        <uni-field :caption="i18n.firstName_" :english="actor.first_name" :arabic="actor.first_name_ar"></uni-field>
        <uni-field :caption="i18n.middleName_" :english="actor.middle_name" :arabic="actor.middle_name_ar"></uni-field>

      </div>
      <uni-field :caption="i18n.lastName_" :english="actor.last_name" :arabic="actor.last_name_ar"></uni-field>
      <div class="d-flex">
        <uni-field :caption="i18n.mothersName_" :english="actor.mother_name" :arabic="actor.mother_name_ar"></uni-field>
        <uni-field :caption="i18n.sex_" :english="actor._sex"></uni-field>
        <uni-field :caption="i18n.age_" :english="actor._age"></uni-field>
      </div>
      <div class="d-flex">
        <uni-field :caption="i18n.civilian_" :english="actor._civilian"></uni-field>
        <uni-field :caption="i18n.actorType_" :english="actor._actor_type"></uni-field>

      </div>
      <uni-field :caption="i18n.condition_" :english="actor.condition"></uni-field>
      <uni-field :caption="i18n.birthPlace_" v-if="actor.birth_place" :english="actor.birth_place.full_string"></uni-field>
      <uni-field :caption="i18n.residencePlace_" v-if="actor.residence_place"
                 :english="actor.residence_place.full_string"></uni-field>
      <uni-field :caption="i18n.originPlace_" v-if="actor.origin_place"
                 :english="actor.origin_place.full_string"></uni-field>


      <div class="d-flex">
        <uni-field :caption="i18n.occupation_" :english="actor.occupation" :arabic="actor.occupation_ar"></uni-field>
        <uni-field :caption="i18n.position_" :english="actor.position" :arabic="actor.position_ar"></uni-field>
      </div>

      <div class="d-flex">
        <uni-field :caption="i18n.spokenDialects_" :english="actor.dialects" :arabic="actor.dialects_ar"></uni-field>
        <uni-field :caption="i18n.familyStatus_" :english="actor.family_status" :arabic="actor.family_status_ar"></uni-field>
      </div>


      <v-card v-if="actor.ethnography && actor.ethnography.length" outlined
              class="mx-2 my-1 pa-2 d-flex align-center flex-grow-1" color="grey lighten-5 ">
        <div class="caption grey--text mr-2">{{ i18n.ethnographicInfo_ }}</div>
        <v-chip x-small v-for="e in actor._ethnography" color="blue-grey lighten-5" class="caption black--text mx-1">{{ e }}</v-chip>

      </v-card>
      <v-card v-if="actor.nationality && actor.nationality.length" outlined
              class="mx-2 my-1 pa-2 d-flex align-center flex-grow-1" color="grey lighten-5 ">
        <div class="caption grey--text mr-2">{{ i18n.nationalities_ }}</div>
        <v-chip x-small v-for="n in actor._nationality" color="blue-grey lighten-5" class="caption black--text mx-1">{{ n }}</v-chip>

      </v-card>


      <uni-field :caption="i18n.nationalIDCard_" :english="actor.national_id_card"></uni-field>


      <v-card outlined class="ma-2" color="grey lighten-5" v-if="actor.sources && actor.sources.length">

        <v-card-text>
          <div class="px-1 title black--text">{{ i18n.sources_ }}</div>
          <v-chip-group column>
            <v-chip small color="blue-grey lighten-5" v-for="source in actor.sources"
                    :key="source.id">{{ source.title }}</v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>


      <v-card outlined class="ma-2" color="grey lighten-5" v-if="actor.labels && actor.labels.length">
        <v-card-text>
          <div class="px-1 title black--text">{{ i18n.labels_ }}</div>
          <v-chip-group column>
            <v-chip small color="blue-grey lighten-5" v-for="label in actor.labels"
                    :key="label.id">{{ label.title }}</v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>

      <v-card outlined class="ma-2" color="grey lighten-5" v-if="actor.verLabels && actor.verLabels.length">
        <v-card-text>
          <div class="px-1 title black--text">{{ i18n.verifiedLabels_ }}</div>
          <v-chip-group column>
            <v-chip small color="blue-grey lighten-5" v-for="label in actor.verLabels"
                    :key="label.id">{{ label.title }}</v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>


      <v-card outlined class="ma-2" color="grey lighten-5" v-if="actor.events && actor.events.length">
        <v-card-text>
          <div class="px-1 title black--text">{{ i18n.events_ }}</div>
          <event-card v-for="event in actor.events" :key="event.id" :event="event"></event-card>
        </v-card-text>
      </v-card>


      <v-card outlined class="ma-2" v-if="actor.medias && actor.medias.length">
        <v-card outlined id="iplayer" v-if="active">

        </v-card>
        <v-card-text>
          <div class="px-1 mb-3 title black--text">{{ i18n.media }}</div>
          <v-layout wrap>
            <v-flex class="ma-2" md6 v-for="media in actor.medias">
              <media-card v-if="active" @thumb-click="viewThumb" @video-click="viewVideo" :media="media"></media-card>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      
      <mp-card v-if="actor.MP" :i18n="i18n" :actorId="actor.id"></mp-card>

      <!-- Related Actors -->
      <v-card outlined color="grey lighten-5" class="ma-2" v-if="actor.actor_relations && actor.actor_relations.length">

        <v-card-text>
          <div class="pa-2 header-sticky title black--text">{{ i18n.relatedActors_ }}
          <v-tooltip top>
              <template v-slot:activator="{on,attrs}">
                <a :href="'/admin/actors/?reltoa='+actor.id" target="_self">
                  <v-icon v-on="on" small color="grey" class="mb-1">
                    mdi-image-filter-center-focus-strong
                  </v-icon>
                </a>
              </template>
              <span>Filter and display related items in main table</span>
            </v-tooltip>
          </div>
          <actor-result :i18n="i18n"  class="mt-1" v-for="(item,index) in actor.actor_relations" :key="index" :actor="item.actor">
            <template v-slot:header>

              <v-sheet color="yellow lighten-5" class="pa-2">

                <div class="caption ma-2">{{ i18n.relationshipInfo_ }}</div>
                <v-chip v-if="item.probability!=null" color="blue-grey lighten-5" small label>{{ probability(item) }}</v-chip>
                <v-chip v-if="item.related_as!=null" color="blue-grey lighten-5" small
                        label>{{ actor_related_as(item) }}</v-chip>
                <v-chip v-if="item.comment" color="blue-grey lighten-5" small label>{{ item.comment }}</v-chip>

              </v-sheet>

            </template>
          </actor-result>
        </v-card-text>
        <v-card-actions>
          <v-btn class="ma-auto caption" small color="blue-grey lighten-5" elevation="0" @click="loadActorRelations(actorPage)" v-if="actorLM">Load More <v-icon right>mdi-chevron-down</v-icon> </v-btn>
        </v-card-actions>
      </v-card>

      <v-card outlined color="grey lighten-5" class="ma-2" v-if="actor.bulletin_relations && actor.bulletin_relations.length">

        <v-card-text>
          <div class="pa-2 header-sticky title black--text">{{ i18n.relatedBulletins_ }}
          <v-tooltip top>
              <template v-slot:activator="{on,attrs}">
                
                <a :href="'/admin/bulletins/?reltoa='+actor.id" target="_self"><v-icon v-on="on" small color="grey" class="mb-1">
              mdi-image-filter-center-focus-strong
            </v-icon></a>
              </template>
              <span>Filter and display related items in main table</span>
            </v-tooltip>
          </div>
          <bulletin-result :i18n="i18n"  class="mt-1" v-for="(item,index) in actor.bulletin_relations" :key="index"
                           :bulletin="item.bulletin">
            <template v-slot:header>
              <v-sheet color="yellow lighten-5" class="pa-2">
                <div class="caption ma-2">{{ i18n.relationshipInfo_ }}</div>
                <v-chip v-if="item.probability!=null" class="ma-1" color="blue-grey lighten-5" small label>{{ probability(item) }}</v-chip>
                <v-chip class="ma-1" v-for="r in item.related_as" color="blue-grey lighten-5" small label>{{ bulletin_related_as(r) }}</v-chip>
                <v-chip v-if="item.comment" class="ma-1" color="blue-grey lighten-5" small label>{{ item.comment }}</v-chip>

              </v-sheet>

            </template>
          </bulletin-result>
        </v-card-text>
        <v-card-actions>
          <v-btn class="ma-auto caption" small color="blue-grey lighten-5" elevation="0" @click="loadBulletinRelations(bulletinPage)" v-if="bulletinLM">Load More <v-icon right>mdi-chevron-down</v-icon> </v-btn>
        </v-card-actions>
      </v-card>


      <v-card outlined color="grey lighten-5" class="ma-2" v-if="actor.incident_relations && actor.incident_relations.length">
        <v-card-text>
          <div class="pa-2  header-sticky title black--text">{{ i18n.relatedIncidents_ }}
          <v-tooltip top>
              <template v-slot:activator="{on,attrs}">
                <a :href="'/admin/incidents/?reltoa='+actor.id" target="_self">
                  <v-icon v-on="on" small color="grey" class="mb-1">
                    mdi-image-filter-center-focus-strong
                  </v-icon>
                </a>
              </template>
              <span>Filter and display related items in main table</span>
            </v-tooltip>
          </div>
          <incident-result :i18n="i18n"  class="mt-1" v-for="(item,index) in actor.incident_relations" :key="index"
                           :incident="item.incident">
            <template v-slot:header>

              <v-sheet color="yellow lighten-5" class="pa-2">

                <div class="caption ma-2">{{ i18n.relationshipInfo_ }}</div>
                <v-chip v-if="item.probability!=null" color="blue-grey lighten-5" small label>{{ probability(item) }}</v-chip>
                <v-chip v-if="item.related_as!=null" color="blue-grey lighten-5" small label>{{ incident_related_as(item) }}</v-chip>
                <v-chip v-if="item.comment" color="blue-grey lighten-5" small label>{{ item.comment }}</v-chip>

              </v-sheet>

            </template>
          </incident-result>
        </v-card-text>
        <v-card-actions>
          <v-btn class="ma-auto caption" small color="blue-grey lighten-5" elevation="0" @click="loadIncidentRelations(incidentPage)" v-if="incidentLM">Load More <v-icon right>mdi-chevron-down</v-icon> </v-btn>
        </v-card-actions>
      </v-card>


      <div class="d-flex">
        <uni-field :caption="i18n.publishDate_" :english="actor.publish_date"></uni-field>
        <uni-field :caption="i18n.documentationDate_" :english="actor.documentation_date"></uni-field>
        <uni-field :caption="i18n.verificationDate" :english="actor.verification_date"></uni-field>
      </div>
      <uni-field :caption="i18n.sourceLink_" :english="actor.source_link"></uni-field>


      <v-card v-if="actor.status==='Peer Reviewed'" outline elevation="0" class="ma-2" color="light-green lighten-5">
        <v-card-text>
          <div class="px-1 title black--text">{{ i18n.review_ }}</div>
          <div v-html="actor.review" class="pa-1 my-2 grey--text text--darken-2">

          </div>
          <v-chip small label color="lime">{{ actor.review_action }}</v-chip>
        </v-card-text>
      </v-card>

      <!-- Log -->
      <v-card v-if="log" outline elevation="0" class="ma-2">
        <v-card-text>
          <h3 class="title black--text align-content-center">{{ i18n.logHistory_ }}
            <v-btn fab :loading="hloading" @click="loadRevisions" small class="elevation-0 align-content-center">
              <v-icon>mdi-history</v-icon>
            </v-btn>
          </h3>

          <template v-for="(revision,index) in revisions">
            <v-card color="grey lighten-4" dense flat class="my-1 pa-2 d-flex align-center">
              <span class="caption">{{ revision.data['comments'] }} - <v-chip x-small label
                                                                              color="gv lighten-3">{{ translate_status(revision.data.status) }}</v-chip> - {{ revision.created_at }}
                - By {{ revision.user.username }}</span>
              <v-spacer></v-spacer>

              <v-btn v-if="diff" v-show="index!==revisions.length-1" @click="showDiff($event,index)" class="mx-1"
                     color="grey" icon small>
                <v-icon>mdi-compare</v-icon>
              </v-btn>

            </v-card>

          </template>
        </v-card-text>

      </v-card>
      <v-dialog
          v-model="diffDialog"
          max-width="770px"
      >
        <v-card class="pa-5">
          <v-card-text>
            <div v-html="diffResult">
            </div>
          </v-card-text>
        </v-card>

      </v-dialog>


      <!-- Root Card   -->
      </v-card>
    `,
});
