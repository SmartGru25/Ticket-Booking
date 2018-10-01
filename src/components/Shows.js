import React, {Component} from 'react';
import '../App.css';

import {BrowserRouter, Route, Link, Switch} from 'react-router-dom'
import {
    Button,
    Modal,
    Dropdown,
    Divider,
    Form,
    Input
} from 'semantic-ui-react';
import axios from 'axios';
import moment from 'moment';
import {DatetimePickerTrigger} from 'rc-datetime-picker';
import {ToastContainer,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


/*  ................................
.........Main App class ...........
.......
 * ...........................
 */
const APIURL = "http://192.168.0.105:8080";

const addshow = '/shows/add';
const listshows = '/client/listshows';
const listclientscreen = '/client/listscreens';
const listevent = "/client/listevents";
const listcatforscreen = "/categories"; //{screen_id}/categories;
const ctoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjExNTM4MTIxNjgwf' +
        'Q.hSa8tiEWRqpOChnS0HODzKnIsiKbz2cvwuwFCOkzcds';

class Shows extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            eventData: [],
            screenData: [],
            categoryData: [],
            showData:[],
            categoryPriceData:[],//filled when form submitted
            newshowform: false,
            formOpen2: false,
            eventId: null,
            screenId: null,
            moment: moment(),
        }
        this.toggleNewShowForm = this
            .toggleNewShowForm
            .bind(this);
        this.getCategoryforScreen = this
            .getCategoryforScreen
            .bind(this);
            this.handleShowSubmit=this.handleShowSubmit.bind(this);
            this.handleFormChange=this.handleFormChange.bind(this);
            
            // this.checkIfCategoryPriceExists=this.checkIfCategoryPriceExists.bind(this);
    }

    handleDateChange = (moment) => {
        this.setState({moment});
        console.log(moment.format('YYYY-MM-DD HH:mm'));
    }

    toggleNewShowForm = () => {
        var ctx = this;
        this.setState({
            newshowform: !this.state.newshowform,
            screenId: null,
            categoryDate: []
        });
        console.log(this.state.newshowform)
        if (!this.state.newshowform) {
            //fetching show
            axios({
                method: 'get',
                url: APIURL + listclientscreen,
                headers: {
                    'USER_TOKEN': ctoken
                }
            })
                .then(function (response) {
                    console.log(response.data);
                    var repl = response
                        .data
                        .map(function (obj) {
                            return {key: obj.id, value: obj.id, location: obj.location, text: obj.name}
                        })

                    ctx.setState({screenData: repl})

                })
                .catch(function (error) {
                    console.log(error);
                })
            }

            //fetching event
            axios({
                method: 'get',
                url: APIURL + listevent,
                headers: {
                    'USER_TOKEN': ctoken
                }
            })
                .then(function (response) {
                    console.log(response.data);
                    var repl = response
                        .data
                        .map(function (obj) {
                            return {key: obj.id, value: obj.id, duration: obj.duration, text: obj.name}
                        })

                    ctx.setState({eventData: repl})

                })
                .catch(function (error) {
                    console.log(error);
                })
            }
        changeEvent = (event, data) => {
        this.setState({eventId: data.value})
    }

    changeScreen = (event, data) => {
        this.setState({screenId: data.value})
        this.getCategoryforScreen(data.value);
    }

    getCategoryforScreen = (cid) => {
        var ctx = this;
        axios({
            method: 'get',
            url: APIURL + listclientscreen + '/' + cid + listcatforscreen,
            headers: {
                'USER_TOKEN': ctoken
            }
        })
            .then(function (response) {
                console.log(response.data);
                // this.setState({     categoryData: });
                var catpricing=response.data.map(function(c){
                    return {category:c.id,price:null}
                });
                ctx.setState({categoryData: response.data,categoryPriceData:catpricing})
                console.log(catpricing);
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    //  checkIfCategoryPriceExists(categoryId) {
    //     return this.state.categoryPriceData.some((cat) => Object.keys(cat).indexOf(categoryId) > -1)
    //   }

    handleFormChange(event){
       
            // this.state.categoryPriceData.forEach(element => {
            //     if(element.category===event.target.name){
            //     element.price=event.target.value;
            //     }
            // });
            this.state.categoryPriceData=this.state.categoryPriceData.map(function(obj){
                if(obj.category==event.target.name)
                {
                    obj.price=event.target.value;
                    //console.log('data found'+ obj.category);
                    return obj;
                }
                return obj;

                console.log('new val for '+event.target.name+ 'is '+event.target.value);
                console.log(obj);
            });

            // console.log('NEW PRICE::: '+ this.state.categoryPriceData   );
    }

    handleShowSubmit(event){
        event.preventDefault();
        var context=this;
        axios({
            method: 'post',
            url: APIURL+addshow,
            data:{
                
                'event_id':this.state.eventId,
                'screen_id':this.state.screenId,
                'datetime':this.state.moment.format('YYYY-MM-DD HH:mm') ,
                'category-price':this.state.categoryPriceData,
            },
            headers: {
                'USER_TOKEN': ctoken,
            },
        })
        
            .then(function (response) {
                console.log(response.data);
               context.setState({
                    newshowform:false,
               })
               toast.success('Response: '+response.data.message,{
                   position:toast.POSITION.TOP_CENTER,
                   zindex:199,
               });
               
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                toast.error(error, {
                    position: toast.POSITION.TOP_CENTER,
                  });
            });
    }

    render() {
        const {
            isLoading,
            eventData,
            screenData,
            newshowform,
            eventId,
            screenId
        } = this.state;

        const shortcuts = {
            'Today': moment(),
            'Yesterday': moment().subtract(1, 'days'),
            'Clear': ''
        };

        return (
            <div>
                <ToastContainer autoClose={2000} />
                <Button primary="primary" onClick={this.toggleNewShowForm}>Add New Show</Button>

                <h1 align='center'>Shows List</h1>

                {isLoading?
                (<div><Button className="btn btn-primary btn-loading"></Button></div>)
                :
                (   <div>
                    <h1>sasa</h1>
                    {this.state.showData.map(show=>{
                        const{screen_name,datetime}=show;
                        return(
                        <div>
                        <h3>ScreenName: {screen_name}</h3>
                        <p>Time: {datetime}</p>
                        </div>
                        );
                    })}
                    </div>
                )
                }

                <Modal dimmer='blurring' open={newshowform} onClose={this.toggleNewShowForm}>
                    <Modal.Header>Add New Shows</Modal.Header>
                    <Modal.Content >
                        <label>Event Name</label>
                        <Dropdown
                            placeholder='Select Event'
                            fluid="fluid"
                            search="search"
                            selection="selection"
                            options={eventData}
                            onChange={this.changeEvent}/>
                        <br></br>
                        <Divider/>
                        <label>Select Screen</label>
                        <Dropdown
                            placeholder='Select Screen'
                            fluid="fluid"
                            search="search"
                            selection="selection"
                            options={screenData}
                            onChange={this.changeScreen}/>

                        <Divider/>
                        <DatetimePickerTrigger
                            shortcuts={shortcuts}
                            moment={this.state.moment}
                            onChange={this.handleDateChange}>
                            <input
                                type="text"
                                value={this.state.moment
                                    .format('YYYY-MM-DD HH:mm')}
                                readOnly="readOnly"/>
                        </DatetimePickerTrigger>

                        <Divider/>
                        <label>Category Prices:</label>
                        <br></br>

                        <Form
                            style={{
                                marginLeft: 50,
                                marginTop: 10
                            }}>

                            {
                                this
                                    .state
                                    .categoryData
                                    .map(cat => {
                                        const {id, name} = cat;
                                        return (
                                            <Form.Field inline="inline">
                                                <label>{name}</label>
                                                <Input type="number" name={id} placeholder='Price' onChange={this.handleFormChange}/>
                                            </Form.Field>
                                        );
                                    })

                            }
                        </Form>
                        <Divider/>
                        <strong>Status</strong>
                        <p>eventid: {eventId}</p>
                        <p>screenid: {screenId}</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='red' onClick={this.toggleNewShowForm}>
                            Cancel
                        </Button>
                        <Button
                            positive="positive"
                            icon='checkmark'
                            labelPosition='right'
                            content="Submit"
                            onClick={this.handleShowSubmit}/>
                    </Modal.Actions>
                </Modal>

                {/* {error ? <p>{error.message}</p> : null} */}
                {/*
      {!isLoading ? (
        eventsdata.map(event => {
          const { username, name, email } = user;
          return (
            <div key={username}>
              <p>Name: {name}</p>
              <p>Email Address: {email}</p>
              <hr />
            </div>
          );
        })
      // If there is a delay in data, let's let the user know it's loading
      ) : (
        <h3>Loading...</h3>
      )} */
                }

            </div>

        );
    }

    componentDidMount() {
        var context=this;
        // Make a request for a user with a given ID
        axios({
            method: 'get',
            url: APIURL+listshows,
            headers: {
                'USER_TOKEN': ctoken,
            },
            //withCredentials:true,
            

        })
      
            .then(function (response) {
                console.log(response.data);

                // handle success
                context.setState({showData: response.data, isLoading: false})
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });

            
        }
    

}

export default Shows;