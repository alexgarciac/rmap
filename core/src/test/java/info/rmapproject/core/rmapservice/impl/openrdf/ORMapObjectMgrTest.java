/*******************************************************************************
 * Copyright 2017 Johns Hopkins University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This software was produced as part of the RMap Project (http://rmap-project.info),
 * The RMap Project was funded by the Alfred P. Sloan Foundation and is a 
 * collaboration between Data Conservancy, Portico, and IEEE.
 *******************************************************************************/
/**
 * 
 */
package info.rmapproject.core.rmapservice.impl.openrdf;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.junit.Test;
import org.openrdf.model.IRI;
//import org.openrdf.model.Model;
import org.openrdf.model.Statement;
import org.openrdf.model.Value;
//import org.openrdf.model.vocabulary.DCTERMS;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.repository.RepositoryException;
import org.springframework.beans.factory.annotation.Autowired;

import info.rmapproject.core.exception.RMapDefectiveArgumentException;
import info.rmapproject.core.exception.RMapException;
import info.rmapproject.core.idservice.IdService;
import info.rmapproject.core.model.RMapIri;
import info.rmapproject.core.model.event.RMapEventTargetType;
import info.rmapproject.core.model.impl.openrdf.ORAdapter;
import info.rmapproject.core.model.impl.openrdf.ORMapDiSCO;
import info.rmapproject.core.model.impl.openrdf.ORMapEventCreation;
import info.rmapproject.core.vocabulary.impl.openrdf.RMAP;
import info.rmapproject.testdata.service.TestConstants;

/**
 * @author smorrissey, khanson
 *
 */
public class ORMapObjectMgrTest extends ORMapMgrTest {
	
	@Autowired 
	private IdService rmapIdService;
	
	@Autowired 
	ORMapDiSCOMgr discomgr;

	/**
	 * Test method for {@link info.rmapproject.core.rmapservice.impl.openrdf.ORMapObjectMgr#createStatement(info.rmapproject.core.rmapservice.impl.openrdf.triplestore.SesameTriplestore, org.openrdf.model.Statement)}.
	 */
	@Test
	public void testCreateTriple() {
		try {
			System.out.println("Running test: testCreateTriple()");		
			java.net.URI id1 =null;
				id1 = rmapIdService.createId();
			IRI subject = ORAdapter.uri2OpenRdfIri(id1);
			IRI predicate = RDF.TYPE;
			IRI object = RMAP.DISCO;
			
			IRI context = subject;

			Statement stmt = ORAdapter.getValueFactory().createStatement(subject, predicate, object,context);
			discomgr.createStatement(triplestore, stmt);
			Statement gStmt = null;
			gStmt = triplestore.getStatement(subject, predicate, object, context);
			assertNotNull(gStmt);
			assertEquals(subject, gStmt.getSubject());
			assertEquals(predicate, gStmt.getPredicate());
			assertEquals(object, gStmt.getObject());
			assertEquals(context, gStmt.getContext());
			
		} catch (Exception e) {
			e.printStackTrace();
			fail(e.getMessage());
		}
	}

	/**
	 * Test method for {@link info.rmapproject.core.rmapservice.impl.openrdf.ORMapObjectMgr#isRMapType(info.rmapproject.core.rmapservice.impl.openrdf.triplestore.SesameTriplestore, org.openrdf.model.IRI, org.openrdf.model.IRI)}.
	 */
	@Test
	public void testIsRMapType() {
		try {
			System.out.println("Running test: testIsRMapType()");		
			java.net.URI id1 =null;
			id1 = rmapIdService.createId();
			IRI subject = ORAdapter.uri2OpenRdfIri(id1);
			IRI predicate = RDF.TYPE;
			Value object = RMAP.DISCO;
			Statement stmt = null;
			stmt = ORAdapter.getValueFactory().createStatement(subject, predicate, object);
			triplestore.addStatement(stmt);
			Statement stmt2 = triplestore.getStatement(subject, predicate, object);
			assertNotNull(stmt2);
			assertEquals(stmt.getSubject(),stmt2.getSubject());
			assertEquals(stmt.getPredicate(), stmt2.getPredicate());
			assertEquals(stmt.getObject(), stmt2.getObject());
			assertEquals(stmt.getContext(), stmt2.getContext());
			boolean istype = discomgr.isRMapType(triplestore, subject, RMAP.DISCO);
			assertTrue(istype);
		} catch (RepositoryException e1) {
			e1.printStackTrace();
			fail(e1.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			fail(e.getMessage());
		}		
	}


	/**
	 * Test method for {@link info.rmapproject.core.rmapservice.impl.openrdf.ORMapObjectMgr#isEventId(org.openrdf.model.IRI, info.rmapproject.core.rmapservice.impl.openrdf.triplestore.SesameTriplestore)}.
	 * @throws RMapDefectiveArgumentException 
	 * @throws RMapException 
	 */
	@Test
	public void testIsEventId() throws RMapException, RMapDefectiveArgumentException {
		System.out.println("Running test: testIsEventId()");	
		List<java.net.URI> resourceList = new ArrayList<java.net.URI>();
		try {
			createSystemAgent();
		    IRI creatorIRI = ORAdapter.getValueFactory().createIRI("http://orcid.org/0000-0003-2069-1219");
			resourceList.add(new java.net.URI("http://rmap-info.org"));
			resourceList.add(new java.net.URI
					("https://rmap-project.atlassian.net/wiki/display/RMAPPS/RMap+Wiki"));
			RMapIri associatedAgent = ORAdapter.openRdfIri2RMapIri(creatorIRI);
			ORMapDiSCO disco = new ORMapDiSCO(associatedAgent, resourceList);
			// Make list of created objects
			List<IRI> iris = new ArrayList<IRI>();
			IRI discoContext = disco.getDiscoContext();
			iris.add(discoContext);
			List<RMapIri> createdObjIds = new ArrayList<RMapIri>();
			for (IRI iri:iris){
				createdObjIds.add(ORAdapter.openRdfIri2RMapIri(iri));
			}
			
			ORMapEventCreation event = new ORMapEventCreation(requestAgent, RMapEventTargetType.DISCO, null, createdObjIds);
			Date end = new Date();
			event.setEndTime(end);
			ORMapEventMgr eventMgr = new ORMapEventMgr();
			IRI crEventId = eventMgr.createEvent(event, triplestore);
			assertTrue(eventMgr.isEventId(crEventId, triplestore));
			
		} catch (Exception e) {
			e.printStackTrace();
			fail(e.getMessage());
		}
	}

	/**
	 * Test method for {@link info.rmapproject.core.rmapservice.impl.openrdf.ORMapObjectMgr#isAgentId(org.openrdf.model.IRI, info.rmapproject.core.rmapservice.impl.openrdf.triplestore.SesameTriplestore)}.
	 */
	@Test
	public void testIsAgentId() throws URISyntaxException {
		System.out.println("Running test: testIsAgentId()");	
		try {
			createSystemAgent();
			ORMapAgentMgr agentMgr = new ORMapAgentMgr();
			assertTrue(agentMgr.isAgentId(ORAdapter.uri2OpenRdfIri(new URI(TestConstants.SYSAGENT_ID)), triplestore));
		} catch (Exception e) {
			e.printStackTrace();
			fail("could not create test agent.");
		}		
		
	}

}
