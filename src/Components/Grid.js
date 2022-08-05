import React, {useEffect} from 'react';
import '../css/grid.css'
function Grid({grid}) {
    useEffect(() => { document.getElementById('home').focus(); }, [grid]);
    return (
        <div id="#grid" className='grid'>
            <div className="grid-container">
            {
                grid.map( (row, rindex) => 
                    row.map( (ele, cindex) =>{
                        return <div key={rindex*5+cindex} data-row = {rindex} data-column = {cindex} 
                                    className="grid-item card-wrapper" type='text' maxLength={1}>
                                    <div className="card"> 
                                        <div className="front">{ele}</div>
                                    </div>
                                </div>
                    })
                )
            }
            </div>
        </div>
    );
}

export default Grid;