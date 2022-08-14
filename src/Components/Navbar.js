import '../css/navbar.css';
import '../css/grid.css';
import {InfoCircle} from 'react-bootstrap-icons'
import { Modal, Button } from 'react-bootstrap';

function Navbar({ startGame, setStartGame, showInfo, setShowInfo }) {
    const handleClick = ()=>{
        setStartGame(true);
        setShowInfo(false);
        console.log('clicked')
    }
    return (
        <nav className="navbar navbar-dark justify-content-between col-12">
            <div className="nav-item"></div>
            <h1 className="navbar-brand">Wordle</h1>
            <div className="nav-item">
                <Button onClick={()=>{setShowInfo(true)}} className='badge badge-pill bg-transparent border-0'><InfoCircle/></Button>
                <Modal
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    show={showInfo}
                    centered
                >
                    <Modal.Header className='justify-content-center'>
                        <Modal.Title id="contained-modal-title-vcenter">
                            HOW TO PLAY
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <div>
                                <div>Guess the <strong>WORDLE</strong> in 6 tries.</div>
                                <div>Each guess must be a valid 5-letter word. Hit the enter button to submit.</div>
                                <div>After each guess, the color of the tiles will change to show how close your guess was to the word.</div>
                            </div>
                            <div>
                                <div><strong>Examples</strong></div>
                                <div>
                                    <div className='d-flex flex-row'>
                                        <div className='grid-item text-light rounded bg-success'>W</div>
                                        <div className='grid-item text-light rounded bg-dark'>E</div>
                                        <div className='grid-item text-light rounded bg-dark'>A</div>
                                        <div className='grid-item text-light rounded bg-dark'>W</div>
                                        <div className='grid-item text-light rounded bg-dark'>Y</div>
                                    </div>
                                    <div>The letter W is in the word and in the correct spot.</div>
                                </div>
                                <div>
                                <div className='d-flex flex-row'>
                                        <div className='grid-item text-light rounded bg-dark'>P</div>
                                        <div className='grid-item text-light rounded bg-warning'>I</div>
                                        <div className='grid-item text-light rounded bg-dark'>L</div>
                                        <div className='grid-item text-light rounded bg-dark'>L</div>
                                        <div className='grid-item text-light rounded bg-dark'>S</div>
                                    </div>
                                    <div>The letter I is in the word but in the wrong spot.</div>
                                </div>
                                <div>
                                <div className='d-flex flex-row'>
                                        <div className='grid-item text-light rounded bg-dark'>V</div>
                                        <div className='grid-item text-light rounded bg-dark'>A</div>
                                        <div className='grid-item text-light rounded bg-dark'>G</div>
                                        <div className='grid-item text-light rounded bg-secondary'>U</div>
                                        <div className='grid-item text-light rounded bg-dark'>E</div>
                                    </div>
                                    <div>The letter U is not in the word in any spot.</div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className='col-12' onClick={()=>{handleClick()}}>{
                            startGame? "Resume Game": "Start Game"
                        }</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        </nav>


    )
}

export default Navbar;


