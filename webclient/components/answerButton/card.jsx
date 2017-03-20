// written by Arun Mohan Raj
// importing the required files
import React, {PropTypes} from 'react';
import {
   Image,
   Button,
   Card,
   Icon,
   Menu,
   Modal,
   Form,
   Header,
   Loader,
   Dimmer,
   Popup,
   Checkbox
} from 'semantic-ui-react';
// import Snackbar from 'material-ui/Snackbar';
import SnackBar from 'react-material-snackbar';
// import {TextArea} from 'semantic-ui-react';
import RichTextEditor from 'react-rte';
import Cookie from 'react-cookie';
import SuggestedCards from './suggQueCardsCollection.jsx';
// question card component
class QueCard extends React.Component {
    constructor() {
        super();
        this.state = {
            active: false,
            value: RichTextEditor.createEmptyValue(),
            anscontent: '',
            queSuggest: [],
            open: false,
            modalStatus: false,
            modalOpen: false,
            selectques: [],
            questionLists: [],
            iconName: 'add',
            upVotes: 0,
            downVotes: 0,
            colorName: 'green',
            colorNameUnlike: 'red',
            warnModalStatus: false,
            errormsg: false,
            suggModalOpen: false,
            popupResult: '',
            // openSnackbar: false,
            // snackbarMsg: ''
            snackOpen: false
        };
        this.textVal = this.textVal.bind(this);
        this.postAnswer = this.postAnswer.bind(this);
        this.handleOpenLoader = this.handleOpenLoader.bind(this);
        this.handleCloseLoader = this.handleCloseLoader.bind(this);
    }
    // functions to maintain modal states
    open = () => this.setState({ open: true });
    close = () => this.setState({ open: false, modalStatus: false });
    // function to open loader initially
    handleOpenLoader() {
      this.setState({ active: true });
    }
    // function to close loader after fetching data
    handleCloseLoader() {
      this.setState({ active: false });
    }
    // function to open modal
    modalOpen() {
       this.setState({ modalStatus: true });
    }
    static propTypes = {
        onChange: PropTypes.func
    };
    // setting the written content in answer text area in state
    textVal(e) {
      this.setState({anscontent: e.target.value});
    }
    // setting the written content in answer rich text editor in state
    onChange = (value) => {
        this.setState({value});
        if (this.props.onChange) {
            this.props.onChange(value.toString('html'));
        }
    };
    getPreviousStatus() {
      let emailId = Cookie.load('email');
      let arr = [];
      $.ajax({
          url: `/users/viewFollowCard/${emailId}`,
          type: 'GET',
          success: function(data) {
            data.map(function(item) {
              item.watchingList.map(function(items) {
                arr.push(items);
              });
            });
            for(let i = 0; i < arr.length; i = i + 1) {
              if(this.props.id === arr[i].id) {
                this.setState({iconName: 'minus'});
              }
            }
          }.bind(this)
        });
    }
    // an ajax call inside to find whether a card is already followed or not
    componentWillMount() {
      this.getLikeStatus();
    }
    // function to store answer to mongo and neo4j
    postAnswer() {
      // console.log('inside post Answer');
      // answer data to be stored
      // console.log('message: ', this.state.value.toString('html'));
      // console.log('length: ',this.state.value.toString('html').length);
      if((this.state.value.toString('html')).length > 11) {
      this.handleOpenLoader();
      let ansdata = {
          questionId: this.props.id,
          mail: Cookie.load('email'),
          content: this.state.value.toString('html')
      };
      /* eslint-disable */
      let context = this;
      /* eslint-enable */
      // console.log(JSON.stringify(ansdata));
      // ajax call to add answer in neo4j and mongoDB
      $.ajax({
        url: 'http://localhost:8080/answers/add',
        type: 'POST',
        data: ansdata,
        success: function() {
            // console.log('success',data);
            context.showRelatedQues();
            context.setState({
              active: false
              // openSnackbar: true,
              // snackbarMsg: 'Answer posted successfully'
            });
          },
        error: function() {
            // console.log(this.props.url, status, err.toString());
          }
      });
    }
    else {
      this.setState({errormsg: true});
    }
    }
    // function to show related questions after answering
    showRelatedQues() {
      // console.log('inside showRelatedQues');
      /* eslint-disable */
      let context = this;
      /* eslint-enable */
      // ajax call to get related questions
      $.ajax({
          url: 'http://localhost:8080/list/suggestQues/' + this.props.id,
          type: 'GET',
          success: function(data) {
            // console.log('inside success show related questions',data);
            // console.log(data.records.length);
            if(data.records.length === 0) {
                // console.log(data.records.length);
                context.handleCloseLoader();
            }else{
              // console.log('inside else');
              context.setState({queSuggest: data.records, suggModalOpen: true});
              context.handleCloseLoader();
            }
                // console.log(JSON.stringify(data, undefined, 2));
          },
          error: function() {
              // console.log('error occurred on AJAX');
              // console.log(err);
          }
      });
    }
    // check whether cookie is available so that only registered users can access
    handleOpen() {
        if(Cookie.load('email')) {
          this.setState({active: true});
        }
        else {
          // alert('Please log in to post answer');
        }
    }
    // function to close the modal
    handleClose = () => {
      this.setState({
      warnModalStatus: false,
      modalStatus: false
  });
  // console.log('close');
}
warningModal = () => {
  this.setState({warnModalStatus: true});
}
warningModalCancel = () => {
  this.setState({warnModalStatus: false});
}
// function to get the selected questions
// addSimiliarQuestions(selectedQue, questions)
// {
//  // console.log('getting items from createcards',items);
//    this.setState({selectques: selectedQue});
//    this.setState({questionLists: questions});
//    // console.log('display states',this.state.follows);
// }
// to get array containing the user selected queIDs
    getSuggQueArray(arr) {
      this.setState({questionLists: arr});
    }
    // linking answers with all suggested queIDs
    linkAnswer() {
      this.setState({suggModalOpen: false, snackOpen: true});
      let queArray = this.state.questionLists;
      for (let i = 0; i < queArray.length; i = i + 1) {
        let ansdata = {
            questionId: queArray[i],
            mail: Cookie.load('email'),
            content: this.state.value.toString('html')
        };
        /* eslint-disable */
        let context = this;
        /* eslint-enable */
        $.ajax({
          url: 'http://localhost:8080/answers/add',
          type: 'POST',
          data: ansdata,
          success: function() {
              // console.log('success', data);
            },
          error: function() {
              // console.log(this.props.url, status, err.toString());
            }
        });
      }
      this.close();
    }
    // function to save card in profile
    saveToProfile() {
        let emailId = Cookie.load('email');
        $.ajax({
            url: '/users/saveToProfile',
            type: 'PUT',
            data: {
                emailId: emailId,
                id: this.props.id,
                displayImage: this.props.dp,
                heading: this.props.title,
                statement: this.props.content,
                postedBy: this.props.name,
                views: this.props.views,
                profileImage: this.props.profileImage,
                addedOn: this.props.time,
                category: this.props.category,
                upVotes: this.props.upvote,
                downVotes: this.props.downvote,
                answerCounts: this.props.anscount
            },
            success: function() {
                 this.setState({iconName: 'minus', text: 'saved'});
            }.bind(this),
            error: function() {}
        });
    }
    // getting the initial like status to display
    getLikeStatus() {
        let id = this.props.id;
        let email = Cookie.load('email');
        this.setState({upVotes: this.props.upvote, downVotes: this.props.downvote});
     $.ajax({
            url: 'http://localhost:8080/list/likestatus',
            type: 'POST',
            data: {
                id: id,
                email: email
            },
            success: function(data) {
                // console.log(data);
                if(data.like) {
                    this.setState({
                        colorName: 'blue'
                    });
                }
                else {
                    this.setState({
                        colorName: 'green'
                    });
                }
                if(data.unlike) {
                    this.setState({
                        colorNameUnlike: 'black'
                    });
                }
                else {
                    this.setState({
                        colorNameUnlike: 'red'
                    });
                }
            }.bind(this)
          });
    }
    // function to update like for queCards
    updatelike() {
      // console.log('inside update like');
        let type = 'add';
        let color = 'blue';
        let upVotesTemp = parseInt(this.state.upVotes, 10) + 1;
        if(this.state.colorName === 'green') {
            type = 'add';
            upVotesTemp = parseInt(this.state.upVotes, 10) + 1;
            color = 'blue';
        }
        else {
            type = 'delete';
            upVotesTemp = parseInt(this.state.upVotes, 10) - 1;
            color = 'green';
        }
      let id = this.props.id;
      // console.log('upvotes before increment',this.state.upVotes);
      // console.log('upvotes after increment',upVotesTemp);
      $.ajax({
            url: 'http://localhost:8080/list/updateLike',
            type: 'POST',
            data: {
                id: id,
                upVotes: upVotesTemp,
                email: Cookie.load('email'),
                type: type
            },
            success: function() {
                // console.log('comes success update like');
                this.setState({
                    colorName: color,
                    upVotes: upVotesTemp
                });
            }.bind(this)
          });
    }
    // function to update dislike for queCards
    updateunlike() {
        // console.log("coming to update unlike");
        let type = 'add';
        let color = 'red';
        let downVotesTemp = parseInt(this.state.downVotes, 10) + 1;
        if(this.state.colorNameUnlike === 'red') {
            type = 'add';
            downVotesTemp = parseInt(this.state.downVotes, 10) + 1;
            color = 'black';
        }
        else {
            type = 'delete';
            downVotesTemp = parseInt(this.state.downVotes, 10) - 1;
            color = 'red';
        }
      let id = this.props.id;
      $.ajax({
            url: 'http://localhost:8080/list/updateunlike',
            type: 'POST',
            data: {
                id: id,
                downVotes: downVotesTemp,
                email: Cookie.load('email'),
                type: type
            },
            success: function() {
              // console.log('success dislike');
                this.setState({
                    colorNameUnlike: color,
                    downVotes: downVotesTemp
                });
            }.bind(this)
          });
    }
    /* ajax call To create a report for question by the user created by Soundar*/
state = {}
handleChange = (e, { value }) => this.setState({ value })

changeType()
{
  this.sendReport(this.state.value);
}
sendReport(value)
{
  let id = this.props.id;
  let email = Cookie.load('email');
  $.ajax({
      url: 'http://localhost:8080/list/createReport',
      type: 'POST',
      data: {
          id: id,
          email: email,
          type: value
      },
      success: function(data) {
          this.setState({reportResult: data});
      }.bind(this),
      error: function() {}
  });
}
checkReport()
{
let id = this.props.id;
let email = Cookie.load('email');
$.ajax({
    url: 'http://localhost:8080/list/changePopup',
    type: 'POST',
    data: {
        id: id,
        email: email
    },
    success: function(data) {
        this.setState({popupResult: data});
    }.bind(this),
    error: function() {}
});
}
// handleRequestClose = () => {
//     this.setState({openSnackbar: false});
// };
    render() {
        // const { open } = this.state;
        const { active } = this.state;
        let errorMessage;
        let pop = '';
if(this.state.popupResult !== 'First Report')
  {
    pop = (
        <div>
        <h4 id='h4'>Already Reported as ....</h4>
        <h4>{this.state.popupResult}</h4>
        </div>
    );
  }
  else {
    pop = (
      <div>
      <Form>
<Form.Field>
<Checkbox
radio
label='Violent or crude content'
name='checkboxRadioGroup'
value='Violent or crude content'
checked={this.state.value === 'Violent or crude content'}
onChange={this.handleChange}
/>
</Form.Field>
<Form.Field>
<Checkbox
radio
label='Spam or Promotion of regulated goods and services'
name='checkboxRadioGroup'
value='Spam or Promotion of regulated goods and services'
checked={this.state.value === 'Spam or Promotion of regulated goods and services'}
onChange={this.handleChange}
/>
</Form.Field>
<Form.Field>
<Checkbox
radio
label='Not relevant to the topic or category'
name='checkboxRadioGroup'
value='Not relevant to the topic or category'
checked={this.state.value === 'Not relevant to the topic or category'}
onChange={this.handleChange}
/>
</Form.Field>
</Form>
<div style={{'text-align': 'center'}}><Button content='Report' color='red'
onClick={this.changeType.bind(this)}/></div>
<p style={{'text-align': 'center', color: 'black', fontWeight: 'bold'}}>{this.state.reportResult}
</p>
</div>
);
  }
        let save = (<Icon name={this.state.iconName} circular
                    className='plusbtn' color='red' size='large'/>);
        if(this.state.errormsg) {
          errorMessage = (<div className='errorCss'>Answer cannot be empty</div>);
        }else {
          errorMessage = '';
        }
        // let save = <Icon name='minus' circular
        //             className='plusbtn' color='green' size='large'/>;
        // card component which contains dynamic data
        return (
            <div>
                {
                  <Dimmer active={active} page>
                    <Loader>Fetching Related Questions</Loader>
                  </Dimmer>
              }
                <Card fluid>
                    <Card.Content extra>
                        <Image className='imageAns' floated='left'
                          size='mini' src={this.props.dp}/>
                        <a>
                            {this.props.name}
                        </a>
                        <p>
                            questioned on {this.props.time}
                            <span className='plusbtnhover' onClick={this.saveToProfile.bind(this)}>
                              {save}
                            </span>
                        </p>
                    </Card.Content>
                    <Card.Content>
                        <Card.Header>
                            {this.props.title}
                        </Card.Header>
                        <Card.Description className='ansWidth'>
                            {this.props.content}
                        </Card.Description>
                    </Card.Content>
                    <Menu>
                        <Menu.Item>
                          <span onClick={this.updatelike.bind(this)}>
                            <Icon name='thumbs up'
                              color={this.state.colorName || 'green'} size='large'/>
                            {this.state.upVotes}
                          </span>
                        </Menu.Item>
                        <Menu.Item>
                          <span onClick={this.updateunlike.bind(this)}>
                            <Icon name='thumbs down'
                              color={this.state.colorNameUnlike || 'red'} size='large'/>
                            {this.state.downVotes}
                          </span>
                        </Menu.Item>
                        <Menu.Item>
                            <Icon name='write' color='black' size='large'/>
                            {this.props.anscount} Answers
                        </Menu.Item>
                        <Button className='anspad' color='green'
                          onClick={this.modalOpen.bind(this)}>Answer</Button>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                              <Popup wide
                                trigger={<Icon name='flag' color='red'
                                onClick={this.checkReport.bind(this)}/>}
                                on='click'
                                position='bottom right'
                                hideOnScroll>
                                        {pop}
                                </Popup>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Card>
                <br/>
                {
                  /* modal for writing answers */
                }
                <Modal dimmer={true} open={this.state.modalStatus}>
                  <Modal.Header>{this.props.title}</Modal.Header>
                  <Modal.Content>
                    <Form>
                      <Form.Field>
                        {
                          /*
                          <TextArea className='areasize' placeholder='your answer here..'
                           onChange={this.textVal}/>
                            */
                          }
                          {errorMessage}
                           <RichTextEditor className='rteEditor'
                             value={this.state.value} onChange={this.onChange} />
                           </Form.Field>
                           </Form>
                  </Modal.Content>
                  <Modal.Actions>
                  <Button color='blue'
                    onClick={this.postAnswer.bind(this)}
                    type='button'><Icon name='checkmark'/> Submit</Button>
                  <Button color='red' onClick={this.warningModal} >
                    <Icon name='remove' /> Cancel</Button>
                    {
                      /* modal for showing suggested questions */
                    }
                    <Modal
                      dimmer={true}
                      open={this.state.suggModalOpen}
                      onOpen={this.open}
                      onClose={this.close}
                      size='small'>
                      <Modal.Header>Does your Answer matches with these Questions?</Modal.Header>
                      <Modal.Content>
                      {
                        /* <p>That's everything!</p> */
                      }
                        <SuggestedCards qid={this.props.id} quedata={this.state.queSuggest}
                          ansContent={this.state.anscontent}
                          suggArr={this.getSuggQueArray.bind(this)}/>
                      </Modal.Content>
                      <Modal.Actions>
                        <Button icon='check' color='green' content='All Done'
                          onClick={this.linkAnswer.bind(this)} />
                      </Modal.Actions>
                    </Modal>
                  </Modal.Actions>
                </Modal>
                <Modal basic size='small' open={this.state.warnModalStatus}>
                  <Header icon='archive' content='Discard Answer' />
                  <Modal.Content>
                    <p>Are you sure to discard this Answer?</p>
                  </Modal.Content>
                  <Modal.Actions>
                  <Button color='green' inverted onClick={this.handleClose}>
                    <Icon name='checkmark'/> Yes
                  </Button>
                    <Button basic color='red' inverted onClick={this.warningModalCancel}>
                      <Icon name='remove'/> No
                    </Button>
                  </Modal.Actions>
                </Modal>
                  <SnackBar style={{marginLeft: 320 + 'px', zIndex: 5}}
                     className='snackbarMsg' show={this.state.snackOpen} timer={6000}>
                      <p>Answer Posted Successfully</p>
                    </SnackBar>
            </div>
        );
    }
}
QueCard.propTypes = {
  id: React.PropTypes.number,
  dp: React.PropTypes.string,
  name: React.PropTypes.string,
  time: React.PropTypes.string,
  title: React.PropTypes.string,
  content: React.PropTypes.string,
  upvote: React.PropTypes.string,
  downvote: React.PropTypes.string,
  anscount: React.PropTypes.number,
  views: React.PropTypes.number,
  profileImage: React.PropTypes.string,
  category: React.PropTypes.string
};
module.exports = QueCard;